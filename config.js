/**
 * Elaina - Store (Hardcode-first config)
 * NOTE: For Vercel production, you may prefer ENV vars. But per your request, everything is here.
 */
const config = {
  app: {
    botName: "Elaina - Store",
    developerName: "Yopanjing",
  },

  admin: {
    username: "admin",
    password: "admin123",
    // Used to sign admin cookie; change this to a long random string.
    sessionSecret: "CHANGE_ME_TO_A_RANDOM_SECRET_32+_CHARS",
  },

  mongodb: {
    // Example: "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
    uri: "mongodb+srv://cahyaadi679_db_user:58QH3I3WKqKnwcON@cluster0.gfcudzj.mongodb.net/?appName=Cluster0",
    dbName: "elaina_store",
  },

  telegram: {
    botToken: "8568868090:AAGoSaJENnvIAcjpB0JUOmOm6LJHtwg8D2w",
  },

  pakasir: {
    slug: "newproject",
    apiKey: "AsyIISrYJ67r9M8ZAAE33n5XvWaI9Fa9",
    qrisOnly: true,
  },

  pterodactyl: {
    panelUrl: "https://panel.example.com",
    appApiKey: "PTERODACTYL_APP_API_KEY_HERE",
    // IDs required to create servers. Fill these from your panel:
    locationId: 1,
    nestId: 1,
    eggJsId: 1,
    eggPyId: 2,

    // Allocation settings (must exist on your node):
    // If you don't know, set to null and handle manually.
    nodeId: 1,
    allocationId: 1,

    // Defaults for created server:
    defaultServer: {
      memory: 1024,
      disk: 10240,
      cpu: 100,
      io: 500,
      swap: 0,
      threads: null,
      databases: 0,
      allocations: 1,
      backups: 0,
    }
  },

  reseller: {
    groupLink: "https://t.me/your_group_invite",
  },

  digitalocean: {
    apiKey: "DO_API_KEY_HERE",
    region: "sgp1",
    image: "ubuntu-24-04-x64",
    size: "s-1vcpu-1gb",
  },

  pricing: {
    buyPanel: 22000,
    buyAdminPanel: 50000,
    buyReseller: 15000,
    buyScriptDefault: 12000,
  },

  assets: {
    // Public paths
    thumbnail: "/image/thumbnail.jpg",
    pending: "/image/pending.jpg",
    success: "/image/success.jpg",
    fail: "/image/fail.jpg",
  },

  botUI: {
    // Reply-keyboard labels
    btnBuyPanel: "🛒 Buy Panel",
    btnBuyAdmin: "👑 Buy Admin Panel",
    btnBuyReseller: "🤝 Buy Reseller",
    btnBuyScript: "📦 Buy Script",
  },
};

export default config;
