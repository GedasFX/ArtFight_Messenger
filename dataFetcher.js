const axios = require("axios").default;
const cheerio = require("cheerio");
const { cookie } = require("./config.json");

/**
 * @type {{ expiryDate?: Date; token?: string; }}
 */
let session = {
  expiryDate: new Date(0),
};

async function fetchProfile(name) {
  const sessionExpired = session.expiryDate < new Date();
  const cookieStr = sessionExpired ? `remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=${cookie};` : `laravel_session=${session.token};`;

  const result = await axios.get(`https://artfight.net/~${name}`, { headers: { cookie: cookieStr } });

  if (sessionExpired) {
    const setCookie = result.headers["set-cookie"][0];

    const maxAge = Number(setCookie.match(/Max-Age=(\d+)/)[1]);
    const value = setCookie.match(/laravel_session=(\w+);/)[1];

    session = {
      expiryDate: new Date(Date.now() + maxAge * 1000 - 15 * 60 * 1000),
      token: value,
    };
  }

  const $ = cheerio.load(result.data);

  const attacks = [...$(".profile-attacks-header + div .thumb-attack")];
  const attacksImg = [...$(".profile-attacks-header + div .thumb-attack img")];
  const defenses = [...$(".profile-defenses-header + div .thumb-attack")];
  const defensesImg = [...$(".profile-defenses-header + div .thumb-attack img")];

  const attacksCount = Number(
    $(".profile-attacks-header a")
      .html()
      .match(/View all \((\d+)\).../)[1]
  );
  const defensesCount = Number(
    $(".profile-defenses-header a")
      .html()
      .match(/View all \((\d+)\).../)[1]
  );

  return {
    attacks: attacks.map((x, i) => ({ url: new URL(x.attribs.href), thumbnail: new URL(attacksImg[i].attribs.src) })),
    attacksCount: attacksCount,
    defenses: defenses.map((x, i) => ({ url: new URL(x.attribs.href), thumbnail: new URL(defensesImg[i].attribs.src) })),
    defensesCount: defensesCount,
  };
}

module.exports = {
  fetchProfile,
};
