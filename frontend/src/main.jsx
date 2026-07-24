import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowRight,
  FiBox,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMenu,
  FiPhone,
  FiSend,
  FiTool,
  FiTruck,
  FiX,
  FiZap,
  FiLogIn,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiUpload,
} from "react-icons/fi";
import "./styles.css";
const api = axios.create({ baseURL: "/api" });
const A = "/uploads/";
const SITE_URL = "https://rent-alat.ice.lol";
const seoByPath = {
  "/": {
    title: "Rent Alat Visoko | Iznajmljivanje profesionalnog alata",
    description:
      "Iznajmljivanje profesionalnog alata u Visokom, Sarajevu, Brezi, Kaknju i okolini. Povoljne cijene, brza rezervacija i dostava na adresu.",
  },
  "/alati": {
    title: "Alati za najam | Rent Alat Visoko",
    description:
      "Pregledajte profesionalne alate za gradnju, renoviranje i vrt. Provjerite dostupnost i rezervišite alat u Visokom i okolini.",
  },
  "/o-nama": {
    title: "O nama | Rent Alat Visoko",
    description:
      "Lokalni partner za najam pouzdanog profesionalnog alata u Visokom, Sarajevu, Brezi, Kaknju i okolnim mjestima.",
  },
  "/dostava": {
    title: "Dostava alata | Visoko i okolina",
    description:
      "Dogovorite brzu dostavu i preuzimanje iznajmljenog alata na kućnu ili poslovnu adresu u Visokom i okolini.",
  },
  "/kontakt": {
    title: "Kontakt i rezervacija | Rent Alat Visoko",
    description:
      "Pošaljite upit ili pozovite Rent Alat Visoko na +387 61 059 156 za dostupnost, cijenu i rezervaciju alata.",
  },
};

function RouteSeo() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const seo = seoByPath[pathname] || seoByPath["/"];
  const canonicalPath = seoByPath[pathname] ? pathname : "/";
  const canonicalUrl = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;

  useEffect(() => {
    const setMeta = (selector, attribute, value) => {
      const element = document.head.querySelector(selector);
      if (element) element.setAttribute(attribute, value);
    };
    document.title = isAdmin ? "Administracija | Rent Alat Visoko" : seo.title;
    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[name="robots"]', "content", isAdmin ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[name="twitter:title"]', "content", seo.title);
    setMeta('meta[name="twitter:description"]', "content", seo.description);
  }, [canonicalUrl, isAdmin, seo]);

  return null;
}
const copy = {
  bs: {
    nav: ["Početna", "Alati", "O nama", "Dostava", "Kontakt"],
    hero: "Iznajmljivanje profesionalnog alata",
    sub: "Profesionalna oprema za svaki posao. Brzo, jednostavno i po fer cijeni.",
    book: "Rezerviši alat",
    call: "Pozovi odmah",
    available: "Dostupno",
    unavailable: "Zauzeto",
    day: "KM / dan",
    tools: "Izdvojeni alati",
    toolsSub: "Od provjerenih brendova do besprijekorne usluge.",
    all: "Pogledaj sve alate",
    why: "Zašto Rent Alat Visoko?",
    delivery: "Brza dostava",
    deliveryText: "Dostavljamo alat na vašu adresu u Visokom i okolini.",
    quality: "Profesionalna oprema",
    qualityText: "Pouzdani alati spremni za ozbiljan rad.",
    prices: "Povoljne cijene",
    pricesText: "Jasne dnevne cijene, bez skrivenih troškova.",
    contact: "Pošaljite upit",
    send: "Pošalji poruku",
    about: "Alat koji pokreće projekte.",
    aboutText:
      "Rent Alat Visoko je lokalni partner za profesionalce i kućne majstore. Iznajmite pouzdan alat kada vam treba, bez kompromisa.",
    deliveryTitle: "Dostava alata na vašu adresu.",
    deliveryText2:
      "Nemate prevoz? Mi preuzimamo logistiku. Dogovorite termin, a naš tim donosi alat spreman za rad.",
    form: {
      name: "Ime i prezime",
      phone: "Telefon",
      email: "Email",
      message: "Poruka",
    },
    success: "Hvala! Vaš upit je uspješno poslan.",
    categories: "Kategorije",
    admin: "Administracija",
    login: "Prijava",
    logout: "Odjava",
    manage: "Upravljajte ponudom alata",
    save: "Sačuvaj",
    cancel: "Otkaži",
    add: "Dodaj alat",
    status: "Status",
    price: "Cijena",
    category: "Kategorija",
    noTools: "Nema alata u ovoj kategoriji.",
  },
  en: {
    nav: ["Home", "Tools", "About", "Delivery", "Contact"],
    hero: "Professional tool rental",
    sub: "Professional equipment for every job. Fast, simple and fairly priced.",
    book: "Reserve a tool",
    call: "Call now",
    available: "Available",
    unavailable: "Unavailable",
    day: "KM / day",
    tools: "Featured tools",
    toolsSub: "Trusted brands and seamless service.",
    all: "See all tools",
    why: "Why Rent Alat Visoko?",
    delivery: "Fast delivery",
    deliveryText: "We deliver tools to your address in Visoko and nearby.",
    quality: "Professional equipment",
    qualityText: "Reliable tools ready for serious work.",
    prices: "Fair prices",
    pricesText: "Clear daily prices, with no hidden costs.",
    contact: "Send an enquiry",
    send: "Send message",
    about: "Tools that power projects.",
    aboutText:
      "Rent Alat Visoko is a local partner for professionals and DIY enthusiasts. Rent reliable tools when you need them, without compromise.",
    deliveryTitle: "Tool delivery to your address.",
    deliveryText2:
      "No transport? We handle the logistics. Arrange a time and our team brings tools ready to work.",
    form: {
      name: "Full name",
      phone: "Phone",
      email: "Email",
      message: "Message",
    },
    success: "Thank you! Your enquiry was sent.",
    categories: "Categories",
    admin: "Administration",
    login: "Login",
    logout: "Logout",
    manage: "Manage your tool selection",
    save: "Save",
    cancel: "Cancel",
    add: "Add tool",
    status: "Status",
    price: "Price",
    category: "Category",
    noTools: "No tools in this category.",
  },
};
const categories = [
  "Aku alati",
  "Brusilice",
  "Usisivači",
  "Perilice",
  "Pile",
  "Testere",
  "Građevinski alati",
  "Vrtni alati",
];
const categoryIcons = {
  "Aku alati": "⚡",
  Brusilice: "◉",
  Usisivači: "✦",
  Perilice: "◌",
  Pile: "✂",
  Testere: "⌁",
  "Građevinski alati": "▣",
  "Vrtni alati": "✿",
};
const popularTools = [
  {
    id: "popular-grinder",
    name_bs: "Brusilica",
    name_en: "Angle Grinder",
    description_bs:
      "Profesionalna brusilica za rezanje i brušenje metala, kamena i betona.",
    description_en:
      "Professional angle grinder for cutting and grinding metal, stone and concrete.",
    price: 30,
    image: "/images/tools/brusilica.jpg",
    available: true,
    category: "Brusilice",
  },
  {
    id: "popular-breaker",
    name_bs: "Štemalica",
    name_en: "Demolition Hammer",
    description_bs:
      "Profesionalna štemalica za rušenje betona, zidova i podova.",
    description_en:
      "Professional demolition hammer for breaking concrete, walls and floors.",
    price: 80,
    image: "/images/tools/stemalica.jpg",
    available: true,
    category: "Građevinski alati",
  },
  {
    id: "popular-tiller",
    name_bs: "Motorna freza",
    name_en: "Garden Tiller",
    description_bs: "Motorna freza za obradu zemlje i pripremu vrta.",
    description_en:
      "Powered garden tiller for cultivating soil and preparing garden beds.",
    price: 40,
    image: "/images/tools/motorna-freza.jpg",
    available: true,
    category: "Vrtni alati",
  },
];
function Logo() {
  return (
    <Link className="logo" to="/">
      <img className="brand-mark" src="/brand-mark.png" alt="" />
      <span className="brand-type">
        <b>RENT-ALAT</b>
        <small>BOSNA I HERCEGOVINA</small>
      </span>
    </Link>
  );
}
function Layout({ children, lang, setLang, theme, setTheme }) {
  const t = copy[lang],
    [open, setOpen] = useState(false);
  const links = ["/", "/alati", "/o-nama", "/dostava", "/kontakt"];
  return (
    <>
      <header>
        <div className="nav wrap">
          <Logo />
          <nav className={open ? "open" : ""}>
            {links.map((x, i) => (
              <NavLink onClick={() => setOpen(false)} key={x} to={x}>
                {t.nav[i]}
              </NavLink>
            ))}
            <NavLink onClick={() => setOpen(false)} to="/admin">
              {t.admin}
            </NavLink>
          </nav>
          <div className="nav-actions">
            <button
              className="language"
              onClick={() => setLang(lang === "bs" ? "en" : "bs")}
              aria-label="Change language"
            >
              <span>{lang === "bs" ? "🇧🇦" : "🇬🇧"}</span>
              {lang === "bs" ? "EN" : "BS"}
            </button>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle night mode"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <button
              className="menu"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>
      {children}
      <Footer t={t} />
    </>
  );
}
function Footer({ t }) {
  return (
    <footer>
      <div className="wrap footer">
        <div>
          <Logo />
          <p>
            Profesionalni alat. Pouzdana usluga.
            <br />
            Bosna i Hercegovina.
          </p>
        </div>
        <div>
          <b>Kontakt</b>
          <a href="tel:+38761059156">
            <FiPhone /> +387 61 059 156
          </a>
          <a href="mailto:info@rentalat.ba">
            <FiMail /> info@rentalat.ba
          </a>
        </div>
        <div>
          <b>Pratite nas</b>
          <a
            href="https://maps.google.com/?q=Bosnia+and+Herzegovina"
            target="_blank"
          >
            <FiMapPin /> Google Maps
          </a>
          <span className="social">
            <FiFacebook />
            <FiInstagram />
          </span>
        </div>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} Rent Alat BiH. All rights reserved.
      </div>
    </footer>
  );
}
function ToolCard({ tool, t, onBook }) {
  let img = tool.image?.startsWith("/") ? tool.image : tool.image;
  return (
    <motion.article
      className="tool-card"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="tool-image">
        <img loading="lazy" src={img} alt={tool.name_bs} />
        <span className={tool.available ? "pill available" : "pill"}>
          <i /> {tool.available ? t.available : t.unavailable}
        </span>
      </div>
      <div className="tool-info">
        <small>
          <i className="category-icon">{categoryIcons[tool.category] || "◆"}</i>
          {tool.category}
        </small>
        <h3>{tool[`name_${t === copy.bs ? "bs" : "en"}`]}</h3>
        <p>{tool[`description_${t === copy.bs ? "bs" : "en"}`]}</p>
        <div className="tool-bottom">
          <strong>
            {tool.price} <em>{t.day}</em>
          </strong>
          <button disabled={!tool.available} onClick={onBook}>
            <FiArrowRight />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
function Home({ tools, lang }) {
  const t = copy[lang],
    nav = useNavigate();
  const popularTitle =
    lang === "bs" ? "Popularni alati za najam" : "Popular Rental Tools";
  const popularSubtitle =
    lang === "bs"
      ? "Provjerena oprema za gradnju, renoviranje i uređenje vrta."
      : "Professional equipment for construction, renovation and garden projects.";
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="wrap hero-content">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow"
          >
            <FiZap /> RENT ALAT BiH
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.hero}
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Professional tool rental
          </motion.h2>
          <motion.p className="hero-text">{t.sub}</motion.p>
          <div className="hero-buttons">
            <button className="btn primary" onClick={() => nav("/alati")}>
              {t.book}
              <FiArrowRight />
            </button>
            <a className="btn ghost" href="tel:+38761059156">
              <FiPhone />
              {t.call}
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <FiCheck /> Provjeren kvalitet
            </span>
            <span>
              <FiClock /> Brza rezervacija
            </span>
            <span>
              <FiTruck /> Dostava
            </span>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t.categories}</p>
            <h2>{t.tools}</h2>
            <p>{t.toolsSub}</p>
          </div>
          <Link className="text-link" to="/alati">
            {t.all}
            <FiChevronRight />
          </Link>
        </div>
        <div className="grid tools-grid">
          {tools.slice(0, 6).map((x) => (
            <ToolCard
              key={x.id}
              tool={x}
              t={t}
              onBook={() => nav("/kontakt")}
            />
          ))}
        </div>
      </section>
      <section className="section popular-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">TOP IZBOR</p>
              <h2>{popularTitle}</h2>
              <p>{popularSubtitle}</p>
            </div>
            <Link className="text-link" to="/alati">
              {t.all}
              <FiChevronRight />
            </Link>
          </div>
          <div className="grid tools-grid popular-tools-grid">
            {popularTools.map((x) => (
              <ToolCard
                key={x.id}
                tool={x}
                t={t}
                onBook={() => nav("/kontakt")}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="benefits">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">RENT ALAT</p>
              <h2>{t.why}</h2>
            </div>
          </div>
          <div className="benefit-grid">
            {[
              [FiTruck, t.delivery, t.deliveryText],
              [FiTool, t.quality, t.qualityText],
              [FiZap, t.prices, t.pricesText],
            ].map(([Icon, title, text]) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="benefit"
                key={title}
              >
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function Tools({ tools, lang }) {
  const t = copy[lang],
    [filter, setFilter] = useState("Sve"),
    [query, setQuery] = useState("");
  const nav = useNavigate();
  const shown = tools.filter(
    (x) =>
      (filter === "Sve" || x.category === filter) &&
      `${x.name_bs} ${x.name_en} ${x.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <PageTitle eyebrow={t.categories} title={t.tools}>
      <div className="tool-explorer">
        <div className="filters">
          {["Sve", ...categories].map((x) => (
            <button
              onClick={() => setFilter(x)}
              className={filter === x ? "active" : ""}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <label className="tool-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === "bs"
                ? "Pretraži alat ili kategoriju..."
                : "Search tools or categories..."
            }
          />
        </label>
      </div>
      <div className="grid tools-grid">
        {shown.map((x) => (
          <ToolCard key={x.id} tool={x} t={t} onBook={() => nav("/kontakt")} />
        ))}
      </div>
      {!shown.length && <p>{t.noTools}</p>}
    </PageTitle>
  );
}
function PageTitle({ eyebrow, title, children }) {
  return (
    <main className="page wrap">
      <div className="page-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </main>
  );
}
function About({ lang }) {
  const t = copy[lang],
    areaText =
      lang === "bs"
        ? "Rent Alat Visoko pruža usluge iznajmljivanja i dostave profesionalnog alata na području Visokog, Sarajeva, Breze, Kaknja i okolnih mjesta. Pomažemo kućnim majstorima, izvođačima i firmama da brzo dođu do pouzdane opreme za svaki projekat."
        : "Rent Alat Visoko provides professional tool rental and delivery across Visoko, Sarajevo, Breza, Kakanj and nearby areas. We help homeowners, contractors and businesses quickly access reliable equipment for every project.";
  return (
    <PageTitle
      eyebrow="RENT ALAT VISOKO · SARAJEVO · BREZA · KAKANJ"
      title={t.about}
    >
      <section className="story">
        <div className="story-image">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85"
            alt="Rent Alat Visoko professional tools"
          />
        </div>
        <div>
          <p>{areaText}</p>
          <div className="stats">
            <div>
              <b>18+</b>
              <span>alata u ponudi</span>
            </div>
            <div>
              <b>24h</b>
              <span>brza podrška</span>
            </div>
            <div>
              <b>100%</b>
              <span>posvećenost</span>
            </div>
          </div>
        </div>
      </section>
    </PageTitle>
  );
}
function Delivery({ lang }) {
  const t = copy[lang];
  return (
    <PageTitle eyebrow="RENT ALAT EXPRESS" title={t.deliveryTitle}>
      <section className="delivery">
        <FiTruck />
        <div>
          <h2>{t.delivery}</h2>
          <p>{t.deliveryText2}</p>
          <ul>
            <li>
              <FiCheck /> Dogovor termina koji vama odgovara
            </li>
            <li>
              <FiCheck /> Dostava na kućnu ili poslovnu adresu
            </li>
            <li>
              <FiCheck /> Preuzimanje nakon završenog posla
            </li>
          </ul>
          <Link className="btn primary" to="/kontakt">
            {t.contact}
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </PageTitle>
  );
}
function Contact({ lang }) {
  const t = copy[lang],
    [form, setForm] = useState({ name: "", phone: "", email: "", message: "" }),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageTitle eyebrow="KONTAKT" title={t.contact}>
      <div className="contact-layout">
        <div className="contact-info">
          <h2>Rent Alat BiH</h2>
          <p>
            Tu smo da pomognemo vašem projektu — od izbora alata do dostave.
          </p>
          <a href="tel:+38761059156">
            <FiPhone /> +387 61 059 156
          </a>
          <a href="mailto:info@rentalat.ba">
            <FiMail /> info@rentalat.ba
          </a>
          <span>
            <FiMapPin /> Bosna i Hercegovina
          </span>
        </div>
        <form className="contact-form" onSubmit={submit}>
          {Object.entries(t.form).map(([k, label]) =>
            k === "message" ? (
              <textarea
                required
                key={k}
                placeholder={label}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            ) : (
              <input
                required
                key={k}
                type={k === "email" ? "email" : "text"}
                placeholder={label}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            ),
          )}
          <button className="btn primary" disabled={busy}>
            {busy ? "..." : t.send}
            <FiSend />
          </button>
          {sent && (
            <p className="success">
              <FiCheck /> {t.success}
            </p>
          )}
        </form>
      </div>
    </PageTitle>
  );
}
function Admin({ lang, tools, reload }) {
  const t = copy[lang],
    [token, setToken] = useState(() => localStorage.getItem("rentToken")),
    [cred, setCred] = useState({ username: "", password: "" }),
    [error, setError] = useState(""),
    [edit, setEdit] = useState(null);
  const login = async (e) => {
    e.preventDefault();
    try {
      let r = await api.post("/login", cred);
      localStorage.setItem("rentToken", r.data.token);
      setToken(r.data.token);
    } catch {
      setError("Neispravno korisničko ime ili lozinka.");
    }
  };
  const headers = { Authorization: `Bearer ${token}` };
  const remove = async (id) => {
    if (confirm("Obrisati alat?")) {
      await api.delete(`/tools/${id}`, { headers });
      reload();
    }
  };
  if (!token)
    return (
      <PageTitle eyebrow="ADMIN" title={t.login}>
        <form className="login" onSubmit={login}>
          <FiLogIn />
          <input
            placeholder="Korisničko ime"
            value={cred.username}
            onChange={(e) => setCred({ ...cred, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={cred.password}
            onChange={(e) => setCred({ ...cred, password: e.target.value })}
          />
          <button className="btn primary">
            {t.login}
            <FiArrowRight />
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </PageTitle>
    );
  return (
    <PageTitle eyebrow="ADMIN PANEL" title={t.manage}>
      <div className="admin-top">
        <button
          className="btn primary"
          onClick={() =>
            setEdit({
              name_bs: "",
              name_en: "",
              description_bs: "",
              description_en: "",
              price: 20,
              image: "",
              available: true,
              category: categories[0],
            })
          }
        >
          <FiPlus />
          {t.add}
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            localStorage.removeItem("rentToken");
            setToken(null);
          }}
        >
          {t.logout}
        </button>
      </div>
      {edit && (
        <ToolForm
          tool={edit}
          headers={headers}
          onDone={() => {
            setEdit(null);
            reload();
          }}
          t={t}
        />
      )}
      <div className="admin-list">
        {tools.map((x) => (
          <div key={x.id}>
            <img src={x.image} alt="" />
            <span>
              <b>{x.name_bs}</b>
              <small>
                {x.price} KM · {x.available ? t.available : t.unavailable}
              </small>
            </span>
            <button onClick={() => setEdit(x)}>
              <FiEdit3 />
            </button>
            <button className="danger" onClick={() => remove(x.id)}>
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </PageTitle>
  );
}
function ToolForm({ tool, headers, onDone, t }) {
  const [data, setData] = useState(tool),
    [file, setFile] = useState(null),
    [saving, setSaving] = useState(false);
  const change = (k, v) => setData({ ...data, [k]: v });
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image = data.image;
      if (file) {
        let f = new FormData();
        f.append("image", file);
        let r = await api.post("/upload", f, { headers });
        image = r.data.url;
      }
      let payload = { ...data, image };
      if (data.id) await api.put(`/tools/${data.id}`, payload, { headers });
      else await api.post("/tools", payload, { headers });
      onDone();
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="tool-form" onSubmit={save}>
      <input
        required
        placeholder="Naziv (BS)"
        value={data.name_bs}
        onChange={(e) => change("name_bs", e.target.value)}
      />
      <input
        required
        placeholder="Name (EN)"
        value={data.name_en}
        onChange={(e) => change("name_en", e.target.value)}
      />
      <input
        required
        placeholder="Opis (BS)"
        value={data.description_bs}
        onChange={(e) => change("description_bs", e.target.value)}
      />
      <input
        required
        placeholder="Description (EN)"
        value={data.description_en}
        onChange={(e) => change("description_en", e.target.value)}
      />
      <input
        required
        type="number"
        min="1"
        placeholder={t.price}
        value={data.price}
        onChange={(e) => change("price", +e.target.value)}
      />
      <select
        value={data.category}
        onChange={(e) => change("category", e.target.value)}
      >
        {categories.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <input
        required={!file}
        placeholder="URL slike"
        value={data.image}
        onChange={(e) => change("image", e.target.value)}
      />
      <label className="upload">
        <FiUpload /> Upload slike
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={data.available}
          onChange={(e) => change("available", e.target.checked)}
        />{" "}
        {t.available}
      </label>
      <button className="btn primary" disabled={saving}>
        {saving ? "..." : t.save}
      </button>
      <button type="button" className="btn ghost" onClick={onDone}>
        {t.cancel}
      </button>
    </form>
  );
}
function App() {
  const [lang, setLang] = useState(
      () => localStorage.getItem("rentLang") || "bs",
    ),
    [theme, setTheme] = useState(
      () => localStorage.getItem("rentTheme") || "dark",
    ),
    [tools, setTools] = useState([]),
    [loading, setLoading] = useState(true);
  const reload = () =>
    api
      .get("/tools")
      .then((r) => setTools(r.data))
      .catch(() => setTools([]))
      .finally(() => setLoading(false));
  useEffect(() => {
    localStorage.setItem("rentLang", lang);
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rentTheme", theme);
  }, [theme]);
  useEffect(reload, []);
  if (loading)
    return (
      <div className="loader">
        <img src="/logo.svg" />
        <span />
      </div>
    );
  return (
    <BrowserRouter>
      <RouteSeo />
      <Layout lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home tools={tools} lang={lang} />} />
            <Route
              path="/alati"
              element={<Tools tools={tools} lang={lang} />}
            />
            <Route path="/o-nama" element={<About lang={lang} />} />
            <Route path="/dostava" element={<Delivery lang={lang} />} />
            <Route path="/kontakt" element={<Contact lang={lang} />} />
            <Route
              path="/admin"
              element={<Admin lang={lang} tools={tools} reload={reload} />}
            />
            <Route path="*" element={<Home tools={tools} lang={lang} />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")).render(<App />);
