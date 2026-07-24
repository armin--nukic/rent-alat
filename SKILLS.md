# Operativne smjernice

- Frontend koristi React 19, Vite, React Router, Axios i Framer Motion.
- Javni API je uvijek relativan `/api`, bez hardkodiranog hosta.
- Svi novi interfejs tekstovi trebaju imati bosanski i engleski prijevod.
- Prisma je jedini pristup PostgreSQL bazi, a administrativne rute traže JWT.
- Upload prihvata JPEG, PNG i WebP do 5 MB.
- Produkcijske tajne moraju doći kroz environment varijable.
