const { fetchProfile } = require("./dataFetcher");
const { getState, setState } = require("./stateManager");
const { participants, sleepDuration, webhookUrl } = require("./config.json");
const { WebhookClient, EmbedBuilder } = require("discord.js");

const client = new WebhookClient({ url: webhookUrl });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 *
 * @param {string} name
 * @param {import("./stateManager").AppState} state
 */
async function getUserChanges(name, state) {
  const profile = await fetchProfile(name);

  const previousState = state.attacks[name];

  let newAttacks,
    newDefenses = 0;

  if (previousState) {
    newAttacks = profile.attacksCount - previousState.attacksCount;
    newDefenses = profile.defensesCount - previousState.defensesCount;
  }

  const result = [];

  if (newAttacks > 0) {
    result.push(...profile.attacks.slice(0, newAttacks));
  }
  if (newDefenses > 0) {
    result.push(...profile.defenses.slice(0, newDefenses));
  }

  state.attacks[name] = {
    attacksCount: profile.attacksCount,
    defensesCount: profile.defensesCount,
  };

  return result;
}

/**
 *
 * @param {{ url: URL, thumbnail: URL }[]} attacks
 */
async function runAttacks(attacks) {
  for (const attack of attacks) {
    const embed = new EmbedBuilder()
      .setTitle("Radars detected a new attack!")
      .setURL(attack.url.toString())
      .setThumbnail(`${attack.thumbnail.origin}${attack.thumbnail.pathname}`);
    await client.send({ embeds: [embed] });
  }
}

async function main() {
  while (true) {
    console.info(`${new Date().toISOString()} Starting New Cycle!`);
    const state = getState();

    for (const user of participants) {
      console.debug(`${new Date().toISOString()} Processing user ${user}.`);
      runAttacks(await getUserChanges(user, state));
      await sleep(200); // Let's not DDoS AF
    }

    setState(state);

    await sleep(1000 * 60 * sleepDuration);
  }
}

main();
