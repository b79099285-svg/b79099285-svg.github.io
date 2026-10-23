/* ============================================================
   FexingProject — настройки сайта
   Меняй только этот файл: IP, ссылки и цены подхватятся сами.
   ============================================================ */
window.FEXING = {
  server: {
    name: "FexingProject",
    // IP или домен сервера. Именно это увидят игроки.
    ip: "fexingproject.ru:27015",
    map: "de_mirage",
    mapName: "Mirage",
    format: "5 × 5",
    slots: 10,
    region: "RU",
    // online | maintenance | offline
    status: "online"
  },

  links: {
    // Замени на свои ссылки. Если ссылка пустая — кнопка останется неактивной.
    discord: "https://discord.gg/fexingproject",
    telegram: "https://t.me/fexingproject",
    steam: "https://steamcommunity.com/groups/fexingproject",
    // Ссылка на оформление привилегии: тикет в Discord, бот или магазин.
    buy: "https://discord.gg/fexingproject",
    github: "https://github.com/"
  },

  prices: {
    // Цены в рублях. month — за месяц, forever — разово навсегда.
    vip: { month: 149, forever: 990 },
    premium: { month: 299, forever: 1990 },
    elite: { month: 499, forever: 3490 }
  }
};
