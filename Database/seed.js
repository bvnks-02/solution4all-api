import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import { productModel } from "./models/product.model.js";
import { orderModel } from "./models/order.model.js";
import { serviceModel } from "./models/service.model.js";
import { contactSubmissionModel } from "./models/contactSubmission.model.js";
import { analyticsEventModel } from "./models/analyticsEvent.model.js";
import { userModel } from "./models/user.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/solution4all";

const SALT_ROUNDS = 12;

// Sample products data
const products = [
  {
    slug: "dell-optiplex-7090",
    name_fr: "Dell OptiPlex 7090",
    description_fr: "Ordinateur de bureau professionnel avec processeur Intel Core i7, 16 Go RAM, 512 Go SSD. Idéal pour les environnements de travail exigeants.",
    price_dzd: 185000,
    category: "ordinateurs",
    stock: 15,
    sku: "OPT-7090-I7",
    brand: "Dell",
    images: [],
    active: true,
    featured: true,
  },
  {
    slug: "hp-laserjet-pro-m404",
    name_fr: "HP LaserJet Pro M404",
    description_fr: "Imprimante laser monochrome rapide et fiable. Vitesse d'impression de 38 pages par minute, connectivité WiFi et Ethernet.",
    price_dzd: 65000,
    category: "imprimantes",
    stock: 25,
    sku: "HP-M404DN",
    brand: "HP",
    images: [],
    active: true,
    featured: false,
  },
  {
    slug: "eaton-5px-1500",
    name_fr: "Eaton 5PX 1500 VA",
    description_fr: "Onduleur professionnel 1500 VA avec affichage LCD, protection contre les coupures de courant et les surtensions.",
    price_dzd: 78000,
    category: "onduleurs",
    stock: 10,
    sku: "EAT-5PX1500",
    brand: "Eaton",
    images: [],
    active: true,
    featured: true,
  },
  {
    slug: "dell-poweredge-r740",
    name_fr: "Dell PowerEdge R740",
    description_fr: "Serveur rack haute performance avec processeurs Intel Xeon Scalable, jusqu'à 2 To de RAM, idéal pour la virtualisation et les bases de données.",
    price_dzd: 2500000,
    category: "serveurs",
    stock: 5,
    sku: "DPE-R740",
    brand: "Dell",
    images: [],
    active: true,
    featured: false,
  },
  {
    slug: "cartouche-hp-26a",
    name_fr: "Cartouche HP 26A",
    description_fr: "Cartouche toner originale HP 26A, rendement de 3000 pages. Compatible avec les imprimantes LaserJet Pro M404.",
    price_dzd: 12000,
    category: "consommables",
    stock: 100,
    sku: "HP-26A",
    brand: "HP",
    images: [],
    active: true,
    featured: false,
  },
  {
    slug: "microsoft-office-365-business",
    name_fr: "Microsoft 365 Business Standard",
    description_fr: "Licence annuelle pour Microsoft 365 Business Standard. Inclut Word, Excel, PowerPoint, Outlook, Teams et 1 To de stockage OneDrive.",
    price_dzd: 45000,
    category: "licences",
    stock: 999,
    sku: "MS-365-BS",
    brand: "Microsoft",
    images: [],
    active: true,
    featured: true,
  },
  {
    slug: "windows-server-2022",
    name_fr: "Windows Server 2022 Standard",
    description_fr: "Licence Windows Server 2022 Standard. Sécurité avancée, conteneurisation et support hybride cloud.",
    price_dzd: 350000,
    category: "logiciels",
    stock: 50,
    sku: "WS-2022-STD",
    brand: "Microsoft",
    images: [],
    active: true,
    featured: false,
  },
  {
    slug: "lenovo-thinkpad-t14",
    name_fr: "Lenovo ThinkPad T14",
    description_fr: "Ordinateur portable professionnel avec processeur Intel Core i5, 8 Go RAM, 256 Go SSD. Écran 14 pouces Full HD.",
    price_dzd: 145000,
    category: "ordinateurs",
    stock: 20,
    sku: "LNV-T14-I5",
    brand: "Lenovo",
    images: [],
    active: true,
    featured: true,
  },
];

// Sample services data
const services = [
  {
    slug: "infogerance",
    title_fr: "Infogérance",
    description_fr: "Service complet de gestion et maintenance de votre infrastructure IT. Surveillance 24/7, interventions rapides et support technique dédié.",
    icon_name: "Monitor",
    color_class: "bg-blue-500",
    features: [
      "Surveillance 24/7 de vos systèmes",
      "Maintenance préventive et corrective",
      "Support technique dédié",
      "Rapports mensuels détaillés",
      "Intervention sous 4 heures",
    ],
    sort_order: 1,
    active: true,
    image: "",
  },
  {
    slug: "securite-informatique",
    title_fr: "Sécurité Informatique",
    description_fr: "Protection complète de vos données et systèmes contre les cybermenaces. Audit de sécurité, pare-feu, antivirus et formation.",
    icon_name: "Shield",
    color_class: "bg-red-500",
    features: [
      "Audit de sécurité complet",
      "Pare-feu et antivirus professionnels",
      "Sauvegarde et récupération de données",
      "Formation sensibilisation cybersécurité",
      "Conformité RGPD",
    ],
    sort_order: 2,
    active: true,
    image: "",
  },
  {
    slug: "cloud-et-hebergement",
    title_fr: "Cloud et Hébergement",
    description_fr: "Solutions cloud sécurisées et évolutives pour héberger vos applications et données. Migration, stockage et calcul à la demande.",
    icon_name: "Cloud",
    color_class: "bg-purple-500",
    features: [
      "Migration vers le cloud",
      "Hébergement dédié et mutualisé",
      "Stockage sécurisé et redondé",
      "Évolutivité à la demande",
      "Support technique 24/7",
    ],
    sort_order: 3,
    active: true,
    image: "",
  },
  {
    slug: "developpement-logiciel",
    title_fr: "Développement Logiciel",
    description_fr: "Conception et développement de solutions logicielles sur mesure. Applications web, mobiles et métier adaptées à vos besoins.",
    icon_name: "Code",
    color_class: "bg-green-500",
    features: [
      "Applications web sur mesure",
      "Applications mobiles iOS et Android",
      "Intégration de systèmes existants",
      "Conception UX/UI professionnelle",
      "Maintenance et évolution",
    ],
    sort_order: 4,
    active: true,
    image: "",
  },
  {
    slug: "reseau-et-connectivite",
    title_fr: "Réseau et Connectivité",
    description_fr: "Conception, installation et maintenance de réseaux informatiques. WiFi professionnel, VPN et interconnexion de sites.",
    icon_name: "Network",
    color_class: "bg-yellow-500",
    features: [
      "Conception et installation réseau",
      "WiFi professionnel maillé",
      "VPN et interconnexion de sites",
      "Câblage structuré",
      "Administration et monitoring",
    ],
    sort_order: 5,
    active: true,
    image: "",
  },
  {
    slug: "formation-et-conseil",
    title_fr: "Formation et Conseil",
    description_fr: "Formation professionnelle et conseil stratégique en transformation digitale. Accompagnement personnalisé pour vos équipes.",
    icon_name: "GraduationCap",
    color_class: "bg-indigo-500",
    features: [
      "Formation bureautique",
      "Formation développement et administration",
      "Conseil en transformation digitale",
      "Audit et recommandations IT",
      "Accompagnement au changement",
    ],
    sort_order: 6,
    active: true,
    image: "",
  },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  console.log(`URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // --- Idempotent: only seed if admin user doesn't exist ---
    const existingAdmin = await userModel.findOne({ email: "admin@solution4all.dz" });
    if (existingAdmin) {
      console.log("✅ Admin user already exists — skipping seed (DB already initialized)");
      console.log("Admin credentials:");
      console.log("  Email: admin@solution4all.dz");
      console.log("  Password: admin123456");
      process.exit(0);
    }

    console.log("No admin user found — seeding database...");

    // Create admin user
    console.log("Creating admin user...");
    const adminUser = await userModel.create({
      name: "Admin",
      email: "admin@solution4all.dz",
      password: "admin123456",
      role: "admin",
    });
    console.log(`Admin user created: ${adminUser.email}`);

    // Create products (only if collection is empty)
    const productCount = await productModel.countDocuments();
    if (productCount === 0) {
      console.log("Creating products...");
      const createdProducts = await productModel.insertMany(products);
      console.log(`Created ${createdProducts.length} products`);
    } else {
      console.log(`Products already exist (${productCount}) — skipping`);
    }

    // Create services (only if collection is empty)
    const serviceCount = await serviceModel.countDocuments();
    if (serviceCount === 0) {
      console.log("Creating services...");
      const createdServices = await serviceModel.insertMany(services);
      console.log(`Created ${createdServices.length} services`);
    } else {
      console.log(`Services already exist (${serviceCount}) — skipping`);
    }

    // Create sample contact submission (only if collection is empty)
    const contactCount = await contactSubmissionModel.countDocuments();
    if (contactCount === 0) {
      console.log("Creating sample contact submission...");
      await contactSubmissionModel.create({
        full_name: "Ahmed Benali",
        email: "ahmed@example.dz",
        phone: "+213 555 123 456",
        company: "Entreprise ABC",
        department: "commercial",
        subject: "Demande de devis pour équipement informatique",
        message: "Bonjour, nous souhaitons obtenir un devis pour l'équipement informatique de nos nouveaux bureaux à Alger. Merci de nous contacter pour discuter des besoins.",
        status: "new",
        source_page: "/contact",
      });
    } else {
      console.log(`Contact submissions already exist (${contactCount}) — skipping`);
    }

    // Create sample analytics events (only if collection is empty)
    const analyticsCount = await analyticsEventModel.countDocuments();
    if (analyticsCount === 0) {
      console.log("Creating sample analytics events...");
      const eventTypes = ["page_view", "cta_click", "service_view"];
      const pagePaths = ["/", "/services", "/boutique", "/contact", "/a-propos"];
      const devices = ["desktop", "mobile", "tablet"];

      const analyticsEvents = [];
      for (let i = 0; i < 20; i++) {
        analyticsEvents.push({
          event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          page_path: pagePaths[Math.floor(Math.random() * pagePaths.length)],
          event_label: `event_${i + 1}`,
          referrer: i % 3 === 0 ? "https://google.com" : "",
          session_id: `session_${Math.floor(i / 4) + 1}`,
          device_type: devices[Math.floor(Math.random() * devices.length)],
        });
      }
      await analyticsEventModel.insertMany(analyticsEvents);
      console.log(`Created ${analyticsEvents.length} analytics events`);
    } else {
      console.log(`Analytics events already exist (${analyticsCount}) — skipping`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log("\nAdmin credentials:");
    console.log("  Email: admin@solution4all.dz");
    console.log("  Password: admin123456");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
