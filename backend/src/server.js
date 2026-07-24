import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Shared infrastructure instances. Prisma owns all database access for this API.
const prisma = new PrismaClient();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Uploaded images are persisted in the mounted Docker volume, not inside a disposable container layer.
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (request, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (request, file, callback) => callback(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype))
});

// Email delivery is optional. Messages are always stored in PostgreSQL, even without SMTP credentials.
const mailer = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// JWT middleware protects all stock-management and upload operations.
const auth = (request, response, next) => {
  const token = request.headers.authorization?.split(' ')[1];
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    response.status(401).json({ error: 'Unauthorized' });
  }
};

// This keeps create and update payloads consistent and prevents untrusted extra fields from reaching Prisma.
const cleanTool = (tool) => ({
  name_bs: String(tool.name_bs || '').trim(),
  name_en: String(tool.name_en || '').trim(),
  description_bs: String(tool.description_bs || '').trim(),
  description_en: String(tool.description_en || '').trim(),
  price: Number(tool.price),
  image: String(tool.image || '').trim(),
  available: Boolean(tool.available),
  category: String(tool.category || '').trim()
});

app.get('/health', (request, response) => response.json({ ok: true }));
app.get('/tools', async (request, response) => response.json(await prisma.tool.findMany({ orderBy: { createdAt: 'desc' } })));
app.get('/tools/:id', async (request, response) => {
  const tool = await prisma.tool.findUnique({ where: { id: request.params.id } });
  tool ? response.json(tool) : response.status(404).json({ error: 'Tool not found' });
});

app.post('/login', async (request, response) => {
  const user = await prisma.user.findUnique({ where: { username: request.body.username || '' } });
  if (!user || !(await bcrypt.compare(request.body.password || '', user.passwordHash))) {
    return response.status(401).json({ error: 'Invalid credentials' });
  }
  response.json({ token: jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }), username: user.username });
});

app.post('/tools', auth, async (request, response) => {
  const tool = cleanTool(request.body);
  if (!tool.name_bs || !tool.name_en || !tool.price || !tool.image) return response.status(400).json({ error: 'Required fields missing' });
  response.status(201).json(await prisma.tool.create({ data: tool }));
});
app.put('/tools/:id', auth, async (request, response) => response.json(await prisma.tool.update({ where: { id: request.params.id }, data: cleanTool(request.body) })));
app.delete('/tools/:id', auth, async (request, response) => {
  await prisma.tool.delete({ where: { id: request.params.id } });
  response.status(204).end();
});

app.post('/upload', auth, upload.single('image'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Valid image required' });
  response.status(201).json({ url: `/uploads/${request.file.filename}` });
});

app.post('/contact', async (request, response) => {
  const { name, phone, email, message } = request.body;
  if (!name || !phone || !email || !message) return response.status(400).json({ error: 'All fields required' });
  const saved = await prisma.message.create({ data: { name, phone, email, message } });
  if (mailer) {
    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_RECIPIENT || 'arminnuk@gmail.com',
        replyTo: email,
        subject: `Novi upit: ${name}`,
        text: `Ime: ${name}\nTelefon: ${phone}\nEmail: ${email}\n\nPoruka:\n${message}`
      });
    } catch (error) {
      // Delivery failure must not discard the message already safely stored in the database.
      console.error('Contact email delivery failed:', error.message);
    }
  }
  response.status(201).json(saved);
});

// Avoid leaking internal error details to the public client while preserving server-side diagnostics.
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Server error' });
});

app.listen(process.env.PORT || 8888, () => console.log('API ready'));
