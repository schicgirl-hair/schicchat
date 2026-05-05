const chatBox = document.getElementById("chatBox");
const quickReplies = document.getElementById("quickReplies");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const resetBtn = document.getElementById("resetBtn");
const progressBar = document.getElementById("progressBar");

const CONFIG = window.SCHICCHAT_CONFIG;

const state = {
  step: "",
  name: "",
  contact: "",
  country: "",
  climate: "",
  mainProblem: "",
  texture: "",
  thickness: "",
  density: "",
  lastHydration: "",
  washFrequency: "",
  routine: "",
  breakage: "",
  porosity: "",
  scalp: "",
  styles: "",
  detangling: "",
  products: "",
  buildup: "",
  heat: "",
  water: "",
  foodProtein: "",
  stressSleep: "",
  goal: "",
  timeAvailable: "",
  score: 0,
  profile: "",
  priority: "",
  offer: "",
  redFlags: []
};

const steps = [
  "ask_name", "ask_contact", "ask_country", "ask_climate", "ask_problem",
  "ask_texture", "ask_thickness", "ask_density", "ask_hydration", "ask_wash",
  "ask_routine", "ask_breakage", "ask_porosity", "ask_scalp", "ask_styles",
  "ask_detangling", "ask_products", "ask_buildup", "ask_heat", "ask_water",
  "ask_food", "ask_stress", "ask_goal", "ask_time", "done"
];

function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getSettings() {
  const saved = localStorage.getItem(CONFIG.settingsStorageKey);
  return saved ? JSON.parse(saved) : {
    shopLink: CONFIG.shopLink,
    premiumLink: CONFIG.premiumLink,
    customFinal: CONFIG.customFinal
  };
}


function oneUseEnabled() {
  return CONFIG.enableOneUse === true;
}

function hasUsedDiagnostic() {
  return oneUseEnabled() && localStorage.getItem(CONFIG.usedStorageKey) === "true";
}

function markDiagnosticUsed() {
  if (oneUseEnabled()) {
    localStorage.setItem(CONFIG.usedStorageKey, "true");
  }
}

function showAlreadyUsedScreen() {
  const settings = getSettings();
  chatBox.innerHTML = "";
  setQuickReplies([]);
  progressBar.style.width = "100%";
  // 🔒 Cache complètement la zone de réponse
chatForm.innerHTML = "";

// 🔒 Cache les boutons (sécurité)
quickReplies.style.display = "none";
  const div = document.createElement("div");
  div.className = "used-card";
  div.innerHTML = `
    <h2>💛 Diagnostic déjà utilisé</h2>
    <p>Tu as déjà utilisé ton diagnostic gratuit Schicgirl.</p>
    <p>Pour aller plus loin, tu peux accéder aux offres ou choisir un diagnostic premium plus personnalisé.</p>
    <p><a href="${settings.shopLink}" target="_blank">Comment hydrater les cheveux ?</a></p>
    <p><a href="${settings.premiumLink}" target="_blank">Diagnostique Capillaire Personnalisé</a></p>
    <a class="offer-button" href="${settings.shopLink}" target="_blank">
💧 Voir le guide hydratation
</a>

<a class="offer-button secondary" href="${settings.premiumLink}" target="_blank">
🌿 Routine personnalisée
</a>
  `;
  chatBox.appendChild(div);
}

function setStep(step) {
  state.step = step;
  const index = steps.indexOf(step);
  progressBar.style.width = `${index < 0 ? 0 : Math.round((index / (steps.length - 1)) * 100)}%`;
}

function addMessage(text, sender = "bot", extra = "") {
  const div = document.createElement("div");
  div.className = `message ${sender} ${extra}`;
  if (extra === "html") {
  div.innerHTML = text;
} else {
  div.textContent = text;
}
  chatBox.appendChild(div);

  // Pour les réponses longues (diagnostic), on affiche le DÉBUT de la réponse.
  // Pour les petits messages/question, on garde le comportement naturel vers le bas.
  setTimeout(() => {
    if (extra.includes("result")) {
      div.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, 50);
}

function setQuickReplies(replies) {
  quickReplies.innerHTML = "";
  (replies || []).forEach(reply => {
    const btn = document.createElement("button");
    btn.textContent = reply.label;
    btn.onclick = () => handleUserReply(reply.value, reply.label);
    quickReplies.appendChild(btn);
  });
}

function resetState() {
  Object.keys(state).forEach(k => {
    if (Array.isArray(state[k])) state[k] = [];
    else if (typeof state[k] === "number") state[k] = 0;
    else state[k] = "";
  });
  state.redFlags = [];
}

function startChat() {
  if (hasUsedDiagnostic()) {
    showAlreadyUsedScreen();
    return;
  }

  resetState();
  chatBox.innerHTML = "";
  setQuickReplies([]);
  setStep("ask_name");
  addMessage("💛 Bienvenue chez Schicgirl. Je suis SchicChat, ton coach capillaire virtuel.");
  addMessage("Je vais analyser tes cheveux comme une coach : hydratation, porosité, casse, cuir chevelu, climat, routine, alimentation et habitudes.\n\nÀ la fin, tu reçois un mini diagnostic détaillé avec une routine étape par étape.\n\nComment veux-tu que je t’appelle ?");
}

function handleUserReply(value, label = value) {
  const raw = String(value).trim();
  const input = normalize(raw);
  addMessage(label, "user");

  switch (state.step) {
    case "ask_name":
      state.name = raw;
      setStep("ask_contact");
      addMessage(`Merci ${state.name} 💛\nTu peux laisser ton email ou WhatsApp pour sauvegarder ton mini diagnostic, ou continuer sans contact.`);
      setQuickReplies([{ label: "Continuer sans contact", value: "skip" }]);
      break;

    case "ask_contact":
      state.contact = input === "skip" ? "" : raw;
      setStep("ask_country");
      addMessage("Dans quel pays es-tu ? Cela m’aide à adapter les conseils au climat et aux produits disponibles.");
      setQuickReplies([
        {label:"États-Unis",value:"usa"},
        {label:"Côte d’Ivoire",value:"cote_ivoire"},
        {label:"France",value:"france"},
        {label:"Canada",value:"canada"},
        {label:"Autre",value:"autre"}
      ]);
      break;

    case "ask_country":
      state.country = raw;
      setStep("ask_climate");
      addMessage("Ton climat est plutôt comment ?");
      setQuickReplies([
        {label:"Chaud / sec",value:"hot_dry"},
        {label:"Humide / tropical",value:"humid"},
        {label:"Froid / hiver",value:"cold"},
        {label:"Variable",value:"variable"}
      ]);
      break;

    case "ask_climate":
      state.climate = input;
      setStep("ask_problem");
      addMessage("Qu’est-ce qui te frustre le plus avec tes cheveux actuellement ?");
      setQuickReplies([
        {label:"Cheveux secs",value:"dryness"},
        {label:"Pas de pousse visible",value:"growth"},
        {label:"Casse",value:"breakage"},
        {label:"Chute / tempes",value:"hairloss"},
        {label:"Je suis perdue",value:"lost"}
      ]);
      break;

    case "ask_problem":
      state.mainProblem = input;
      setStep("ask_texture");
      addMessage("Quelle est ta texture dominante ?");
      setQuickReplies([
        {label:"4A / boucles serrées",value:"4a"},
        {label:"4B / zigzag",value:"4b"},
        {label:"4C / coils très serrés",value:"4c"},
        {label:"Mixte",value:"mixed_texture"},
        {label:"Je ne sais pas",value:"unknown"}
      ]);
      break;

    case "ask_texture":
      state.texture = input;
      setStep("ask_thickness");
      addMessage("Tes mèches individuelles sont plutôt :");
      setQuickReplies([
        {label:"Fines",value:"fine"},
        {label:"Moyennes",value:"medium"},
        {label:"Épaisses",value:"thick"},
        {label:"Je ne sais pas",value:"unknown"}
      ]);
      break;

    case "ask_thickness":
      state.thickness = input;
      setStep("ask_density");
      addMessage("Ta densité globale est plutôt :");
      setQuickReplies([
        {label:"Faible",value:"low_density"},
        {label:"Moyenne",value:"medium_density"},
        {label:"Forte",value:"high_density"},
        {label:"Je ne sais pas",value:"unknown"}
      ]);
      break;

    case "ask_density":
      state.density = input;
      setStep("ask_hydration");
      addMessage("À quand remonte ta dernière vraie hydratation ?");
      setQuickReplies([
        {label:"Aujourd’hui",value:"today"},
        {label:"2-3 jours",value:"2_3_days"},
        {label:"1 semaine ou plus",value:"week_plus"},
        {label:"Je ne sais plus",value:"unknown"}
      ]);
      break;

    case "ask_hydration":
      state.lastHydration = input;
      setStep("ask_wash");
      addMessage("À quelle fréquence laves-tu vraiment tes cheveux ?");
      setQuickReplies([
        {label:"Chaque semaine",value:"weekly"},
        {label:"Toutes les 2 semaines",value:"two_weeks"},
        {label:"Toutes les 3-4 semaines",value:"monthly"},
        {label:"Rarement / pas stable",value:"rare"}
      ]);
      break;

    case "ask_wash":
      state.washFrequency = input;
      setStep("ask_routine");
      addMessage("As-tu une routine capillaire claire ?");
      setQuickReplies([
        {label:"Oui, régulière",value:"regular"},
        {label:"Un peu, mais pas stable",value:"unstable"},
        {label:"Non",value:"none"}
      ]);
      break;

    case "ask_routine":
      state.routine = input;
      setStep("ask_breakage");
      addMessage("Tes cheveux cassent-ils quand tu les manipules ?");
      setQuickReplies([
        {label:"Oui beaucoup",value:"high"},
        {label:"Un peu",value:"medium"},
        {label:"Non",value:"low"}
      ]);
      break;

    case "ask_breakage":
      state.breakage = input;
      setStep("ask_porosity");
      addMessage("Quand tu mets de l’eau sur tes cheveux, que remarques-tu ?");
      setQuickReplies([
        {label:"L’eau reste dessus",value:"low_porosity"},
        {label:"Ils absorbent normalement",value:"normal_porosity"},
        {label:"Ils absorbent puis sèchent vite",value:"high_porosity"},
        {label:"Je ne sais pas",value:"unknown"}
      ]);
      break;

    case "ask_porosity":
      state.porosity = input;
      setStep("ask_scalp");
      addMessage("Ton cuir chevelu est plutôt :");
      setQuickReplies([
        {label:"Sec",value:"dry_scalp"},
        {label:"Gras",value:"oily_scalp"},
        {label:"Irrité / démange",value:"irritated"},
        {label:"Normal",value:"normal"}
      ]);
      break;

    case "ask_scalp":
      state.scalp = input;
      setStep("ask_styles");
      addMessage("Quel type de coiffure fais-tu le plus souvent ?");
      setQuickReplies([
        {label:"Coiffures protectrices",value:"protective"},
        {label:"Cheveux libres",value:"loose"},
        {label:"Styles serrés",value:"tight"},
        {label:"Un mélange",value:"mixed"}
      ]);
      break;

    case "ask_styles":
      state.styles = input;
      setStep("ask_detangling");
      addMessage("Comment démêles-tu tes cheveux le plus souvent ?");
      setQuickReplies([
        {label:"Avec soin + produit",value:"gentle_product"},
        {label:"Parfois à sec",value:"sometimes_dry"},
        {label:"Souvent à sec",value:"often_dry"},
        {label:"Je ne sais pas bien faire",value:"unsure"}
      ]);
      break;

    case "ask_detangling":
      state.detangling = input;
      setStep("ask_products");
      addMessage("Tes produits actuels te donnent quel résultat ?");
      setQuickReplies([
        {label:"Mes cheveux aiment",value:"works"},
        {label:"Ça marche parfois",value:"sometimes"},
        {label:"Trop lourd / gras",value:"too_heavy"},
        {label:"Aucun résultat",value:"no_result"}
      ]);
      break;

    case "ask_products":
      state.products = input;
      setStep("ask_buildup");
      addMessage("Après lavage, tes cheveux sont parfois :");
      setQuickReplies([
        {label:"Légers et propres",value:"clean"},
        {label:"Lourds / enrobés",value:"heavy"},
        {label:"Secs malgré le soin",value:"still_dry"},
        {label:"Je ne sais pas",value:"unknown"}
      ]);
      break;

    case "ask_buildup":
      state.buildup = input;
      setStep("ask_heat");
      addMessage("Utilises-tu de la chaleur : sèche-cheveux chaud, plaques, fer ?");
      setQuickReplies([
        {label:"Souvent",value:"often"},
        {label:"Parfois",value:"sometimes"},
        {label:"Rarement / jamais",value:"rare"}
      ]);
      break;

    case "ask_heat":
      state.heat = input;
      setStep("ask_water");
      addMessage("Ton hydratation interne est plutôt :");
      setQuickReplies([
        {label:"Je bois assez d’eau",value:"enough"},
        {label:"Je bois peu",value:"low"},
        {label:"Ça dépend",value:"variable"}
      ]);
      break;

    case "ask_water":
      state.water = input;
      setStep("ask_food");
      addMessage("Manges-tu régulièrement des protéines ? Exemple : œufs, poisson, viande, haricots, lentilles, yaourt.");
      setQuickReplies([
        {label:"Oui régulièrement",value:"regular"},
        {label:"Parfois",value:"sometimes"},
        {label:"Rarement",value:"rare"}
      ]);
      break;

    case "ask_food":
      state.foodProtein = input;
      setStep("ask_stress");
      addMessage("Ces derniers temps, ton stress/sommeil est plutôt :");
      setQuickReplies([
        {label:"Stable",value:"stable"},
        {label:"Stress moyen",value:"medium_stress"},
        {label:"Stress élevé / peu de sommeil",value:"high_stress"}
      ]);
      break;

    case "ask_stress":
      state.stressSleep = input;
      setStep("ask_goal");
      addMessage("Ton objectif principal maintenant ?");
      setQuickReplies([
        {label:"Hydratation",value:"hydration"},
        {label:"Longueur",value:"length"},
        {label:"Volume",value:"volume"},
        {label:"Réparer les tempes",value:"edges"},
        {label:"Routine simple",value:"simple_routine"}
      ]);
      break;

    case "ask_goal":
      state.goal = input;
      setStep("ask_time");
      addMessage("Combien de temps peux-tu vraiment consacrer à tes cheveux par semaine ?");
      setQuickReplies([
        {label:"Moins de 30 min",value:"low_time"},
        {label:"30 min à 1h",value:"medium_time"},
        {label:"Plus d’1h",value:"high_time"}
      ]);
      break;

    case "ask_time":
      state.timeAvailable = input;
      buildCoachDiagnosis();
      break;

    case "done":
      const settings = getSettings();
      if (input === "shop") window.open(settings.shopLink, "_blank");
      if (input === "premium") window.open(settings.premiumLink, "_blank");
      if (input === "restart") startChat();
      break;
  }

  userInput.value = "";
}

function saveLead() {
  const leads = JSON.parse(localStorage.getItem(CONFIG.leadStorageKey) || "[]");
  leads.push({...state, date: new Date().toISOString()});
  localStorage.setItem(CONFIG.leadStorageKey, JSON.stringify(leads));
}

function buildCoachDiagnosis() {
  setStep("done");
  const analysis = analyzeProfile();
  state.score = analysis.score;
  state.profile = analysis.profile;
  state.priority = analysis.priority;
  state.offer = analysis.offer;
  state.redFlags = analysis.redFlags;

  addMessage(`💛 Mini diagnostic Schicgirl pour ${state.name || "ma belle"}

Score santé capillaire : ${analysis.score}/10
Profil détecté : ${analysis.profile}
Priorité actuelle : ${analysis.priority}

Ce que je vois :
${analysis.summary}

Ton problème réel n’est pas seulement ce que tu vois en surface.
Il est surtout lié à :
${analysis.causes}

Lecture coach :
${analysis.coachReading}

Routine détaillée recommandée :
${analysis.routine}

Recettes ou soins maison adaptés :
${analysis.recipes}

Plan starter 7 jours :
${analysis.plan7}

Résultats réalistes à attendre :
${analysis.expectedResults}

Signes d’amélioration :
${analysis.improvementSigns}

Avertissements doux :
${analysis.warnings}

Bonus Schicgirl :
${analysis.bonus}`, "bot", "result");

  const settings = getSettings();
  addMessage(
  `✨ Ce que je te recommande pour aller plus loin :

💧 Si ton problème principal est la sécheresse :
<a href="${settings.shopLink}" target="_blank">Accéder au guide hydratation</a>

🌿 Si tu veux une routine complète adaptée à TON cas :
<a href="${settings.premiumLink}" target="_blank">Accéder à la routine personnalisée</a>

💛 Choisis l’offre qui correspond le mieux à ton besoin actuel.`,
  "bot",
  "html"
);

  saveLead();
  markDiagnosticUsed();

  const replies = [
    {label:"Voir les offres",value:"shop"},
    {label:"Diagnostic premium",value:"premium"}
  ];

  if (!oneUseEnabled()) {
    replies.push({label:"Recommencer",value:"restart"});
  }

  setQuickReplies(replies);
}

function has(value, list) {
  const v = normalize(value);
  return list.some(item => v.includes(normalize(item)));
}

function analyzeProfile() {
  let score = 10;
  const causes = [];
  const redFlags = [];

  if (state.lastHydration === "week_plus" || state.lastHydration === "unknown") { score -= 2; causes.push("Hydratation trop espacée ou difficile à suivre"); }
  if (state.washFrequency === "monthly" || state.washFrequency === "rare") { score -= 1; causes.push("Nettoyage potentiellement trop espacé, surtout en cas d’accumulation"); }
  if (state.routine === "unstable" || state.routine === "none") { score -= 2; causes.push("Routine irrégulière ou absente"); }
  if (state.breakage === "high") { score -= 2; causes.push("Casse importante pendant la manipulation"); }
  if (state.detangling === "often_dry" || state.detangling === "sometimes_dry" || state.detangling === "unsure") { score -= 1; causes.push("Démêlage trop sec, trop rapide ou mal maîtrisé"); }
  if (state.styles === "tight") { score -= 2; causes.push("Coiffures trop serrées ou tension sur les tempes"); }
  if (state.scalp === "irritated") { score -= 1; causes.push("Cuir chevelu irrité ou sensible"); redFlags.push("Si les démangeaisons, plaques, douleurs ou chute forte continuent, consulte un professionnel."); }
  if (state.products === "too_heavy" || state.products === "no_result") { score -= 1; causes.push("Produits peut-être mal adaptés à ta porosité ou à ton épaisseur"); }
  if (state.buildup === "heavy") { score -= 1; causes.push("Accumulation possible de produits"); }
  if (state.heat === "often") { score -= 1; causes.push("Chaleur utilisée trop souvent, ce qui peut accentuer sécheresse et casse"); }
  if (state.water === "low") { score -= 1; causes.push("Hydratation interne faible"); }
  if (state.foodProtein === "rare") { score -= 1; causes.push("Apport en protéines alimentaires possiblement insuffisant"); }
  if (state.stressSleep === "high_stress") { score -= 1; causes.push("Stress élevé ou sommeil insuffisant"); }
  if (state.climate === "hot_dry" || state.climate === "cold") { score -= 1; causes.push("Climat qui peut accentuer la sécheresse"); }

  score = Math.max(1, score);

  let profile = "Routine à stabiliser";
  let offer = "Routine Capillaire Personnalisée";
  let priority = "stabiliser la routine, comprendre les besoins des cheveux et construire une base saine";
  let summary = "Tes cheveux ont besoin d’une routine plus claire, plus régulière et plus simple. Le plus important est de réduire la confusion et de construire une base stable.";
  let routine = detailedSimpleRoutine();

  if (state.mainProblem === "dryness" || state.goal === "hydration" || state.lastHydration === "week_plus") {
    profile = "Sécheresse chronique / hydratation irrégulière";
    offer = "Guide Hydratation Cheveux Crépus";
    priority = state.porosity === "high_porosity" ? "améliorer la rétention d’hydratation et sceller plus efficacement" : "faire pénétrer l’hydratation sans surcharger les cheveux";
    summary = "Tes cheveux semblent manquer d’eau, de scellage et d’une fréquence d’hydratation adaptée. Le problème n’est pas forcément le manque de produits, mais la méthode et la régularité.";
    routine = detailedHydrationRoutine();
  }

  if (state.mainProblem === "growth" || state.goal === "length") {
    profile = "Pousse bloquée par la casse";
    offer = "Programme Pousse & Rétention";
    priority = "réduire la casse et améliorer la rétention de longueur";
    summary = "Tes cheveux poussent probablement, mais la longueur ne se voit pas parce que les pointes cassent, se dessèchent ou ne sont pas assez protégées.";
    routine = detailedGrowthRoutine();
  }

  if (state.mainProblem === "breakage" || state.breakage === "high") {
    profile = "Casse silencieuse / fibre fragilisée";
    offer = "Routine Anti-Casse";
    priority = "réduire la casse, renforcer doucement la fibre et protéger les pointes";
    summary = "Tes cheveux ont besoin de douceur, d’hydratation, d’un soin fortifiant léger et d’une meilleure protection pendant le démêlage et la nuit.";
    routine = detailedBreakageRoutine();
  }

  if (state.mainProblem === "hairloss" || state.goal === "edges" || state.styles === "tight") {
    profile = "Tempes et cuir chevelu à protéger";
    offer = "Programme Tempes & Repousse Douce";
    priority = "réduire la tension, apaiser le cuir chevelu et protéger les zones fragiles";
    summary = "Ta priorité est de réduire la tension, éviter les coiffures serrées, apaiser le cuir chevelu et suivre l’évolution avec patience.";
    routine = detailedEdgesRoutine();
  }

  if (state.mainProblem === "lost" || state.goal === "simple_routine") {
    profile = "Perdue dans les conseils / besoin de simplicité";
    offer = "Diagnostic Capillaire Personnalisé";
    priority = "créer une routine simple, claire et réaliste";
    summary = "Tu as besoin d’un plan facile à suivre, avec peu de produits, mais une bonne régularité. Trop d’informations peut bloquer plus qu’aider.";
    routine = detailedSimpleRoutine();
  }

  const causesText = causes.length ? causes.map(c => `• ${c}`).join("\n") : "• Aucun blocage majeur détecté, mais la régularité reste importante.";
  const warningExtra = redFlags.length ? `\n${redFlags.map(x => `• ${x}`).join("\n")}` : "";

  return {
    score,
    profile,
    priority,
    offer,
    summary,
    causes: causesText,
    coachReading: getCoachReading(),
    routine,
    recipes: getRecipes(),
    plan7: sevenDayPlan(profile),
    expectedResults: getExpectedResults(),
    improvementSigns: getImprovementSigns(),
    warnings: getWarnings() + warningExtra,
    bonus: getBonus(),
    redFlags
  };
}

function getCoachReading() {
  const lines = [];
  lines.push(getPorosityInsight());
  lines.push(getClimateAnalysis());
  lines.push(getTextureAnalysis());
  lines.push(getBuildupAnalysis());
  lines.push(getLifestyleAnalysis());
  return lines.filter(Boolean).join("\n\n");
}

function getPorosityInsight() {
  if (state.porosity === "low_porosity") return "Porosité faible : tes cheveux peuvent avoir du mal à absorber les soins. La clé n’est pas de mettre plus de produit, mais d’appliquer sur cheveux humides, en petites sections, avec chaleur douce si possible.";
  if (state.porosity === "high_porosity") return "Porosité forte : tes cheveux absorbent vite, mais peuvent perdre l’eau rapidement. La clé est d’hydrater puis sceller sans attendre.";
  if (state.porosity === "normal_porosity") return "Porosité normale : tu peux garder une routine équilibrée, sans multiplier les produits. Observe surtout la souplesse et la réaction après 2 semaines.";
  return "Porosité inconnue : observe comment tes cheveux réagissent à l’eau. Si l’eau reste dessus, pense faible porosité. Si l’eau entre vite mais les cheveux sèchent vite, pense forte porosité.";
}

function getClimateAnalysis() {
  if (state.climate === "hot_dry") return "Climat chaud/sec : l’air peut voler l’hydratation. Protège les pointes, scelle mieux, et évite de laisser les cheveux exposés trop longtemps.";
  if (state.climate === "humid") return "Climat humide : les cheveux peuvent gonfler ou rétrécir vite. Une routine légère + coiffures souples aide à garder le contrôle sans alourdir.";
  if (state.climate === "cold") return "Climat froid : les cheveux deviennent souvent plus secs et cassants. Évite de sortir avec les cheveux mouillés et protège bien la nuit.";
  return "Climat variable : ajuste selon la saison. Si les cheveux deviennent lourds, allège. S’ils deviennent secs, renforce hydratation + scellage.";
}

function getTextureAnalysis() {
  const parts = [];
  if (state.texture === "4c") parts.push("Texture 4C/coils serrés : travaille toujours par sections. Le sébum descend moins facilement sur les longueurs, donc les pointes demandent plus d’attention.");
  if (state.texture === "4b") parts.push("Texture 4B : les angles et zigzags peuvent favoriser les nœuds. La douceur au démêlage est essentielle.");
  if (state.texture === "4a") parts.push("Texture 4A : les boucles peuvent paraître hydratées en surface, mais les pointes ont quand même besoin d’être protégées.");
  if (state.thickness === "fine") parts.push("Cheveux fins : évite les beurres lourds en excès et applique peu de produit.");
  if (state.thickness === "thick") parts.push("Cheveux épais : applique par petites sections pour que le soin atteigne toute la masse.");
  if (state.density === "low_density") parts.push("Densité faible : évite de plaquer trop fort les racines et privilégie des coiffures légères.");
  if (state.density === "high_density") parts.push("Densité forte : séparer en sections est indispensable pour bien laver, hydrater et démêler.");
  return parts.join("\n");
}

function getBuildupAnalysis() {
  if (state.buildup === "heavy") return "Accumulation possible : si tes cheveux restent lourds, gras ou enrobés après lavage, il faut parfois clarifier doucement toutes les 4 à 6 semaines.";
  if (state.buildup === "still_dry") return "Cheveux secs malgré le soin : cela peut venir d’un masque pas adapté, d’un manque de scellage ou d’une porosité qui demande une méthode différente.";
  return "Après lavage, observe toujours : cheveux légers = routine ok. Cheveux lourds = possible surcharge. Cheveux secs = soin ou scellage à ajuster.";
}

function getLifestyleAnalysis() {
  const parts = [];
  if (state.water === "low") parts.push("Hydratation interne : boire peu d’eau ne cause pas tout, mais peut participer à des cheveux ternes et fragiles.");
  if (state.foodProtein === "rare") parts.push("Alimentation : les cheveux ont besoin de protéines dans l’alimentation pour soutenir la fibre de l’intérieur.");
  if (state.stressSleep === "high_stress") parts.push("Stress/sommeil : un stress élevé ou un sommeil faible peut influencer la chute, la casse et la santé du cuir chevelu.");
  return parts.length ? parts.join("\n") : "Côté habitudes, garde une routine réaliste. Le corps, le sommeil, le stress et l’alimentation soutiennent aussi la santé capillaire.";
}

function porosityAdvice() {
  if (state.porosity === "low_porosity") return "Porosité faible : applique sur cheveux humides, utilise chaleur douce 10 à 15 minutes pendant les masques, évite de superposer trop de produits lourds.";
  if (state.porosity === "high_porosity") return "Porosité forte : utilise un leave-in crémeux, scelle rapidement après hydratation, et ajoute parfois un soin fortifiant doux si les cheveux cassent.";
  if (state.porosity === "normal_porosity") return "Porosité normale : garde un équilibre simple entre hydratation, nutrition et protection.";
  return "Porosité inconnue : commence léger, observe, puis ajuste selon la réaction des cheveux.";
}

function detailedHydrationRoutine() {
  return `Objectif : ramener l’eau dans la fibre, la garder plus longtemps et éviter que les cheveux redeviennent secs trop vite.

1. Séparer les cheveux
• Fais 4 à 8 sections selon ta densité.
• But : ne pas hydrater seulement le dessus.
• Si tes cheveux sont épais ou 4C, prends des sections plus petites.

2. Pré-hydratation
• Utilise : eau tiède seule ou eau + aloe vera.
• Dosage : 80% eau + 20% aloe vera.
• Vaporise légèrement. Les cheveux doivent être humides, pas trempés.
• Presse doucement les cheveux avec tes mains.

3. Leave-in ou crème hydratante
• Utilise : leave-in à base d’eau, lait capillaire ou crème hydratante légère.
• Applique une petite quantité par section.
• Commence par les pointes, puis remonte vers les longueurs.
• Bon signe : cheveux souples.
• Mauvais signe : cheveux blancs/collants = trop de produit.

4. Scellage
• Utilise : huile légère comme jojoba, avocat, olive légère, pépins de raisin, ou beurre en petite quantité si les cheveux sont très secs.
• Chauffe dans les mains.
• Applique surtout sur les pointes.
• Rappel : l’huile seule n’hydrate pas, elle garde l’eau déjà appliquée.

5. Masque hydratant
• Utilise : masque hydratant, aloe vera, miel dilué, yaourt + miel ou gel de lin.
• Pose 20 à 30 minutes sous charlotte.
• Fréquence : 1 fois/semaine ou toutes les 2 semaines.

6. Protection
• Bonnet ou taie satin chaque nuit.
• Si les cheveux s’emmêlent vite, fais 4 grosses vanilles avant de dormir.

Fréquence : hydratation légère 2 à 3 fois/semaine, masque 1 fois/semaine ou toutes les 2 semaines.

${porosityAdvice()}`;
}

function detailedGrowthRoutine() {
  return `Objectif : garder la longueur que tes cheveux produisent déjà.

1. Protéger les pointes
• Utilise : leave-in + huile légère ou crème scellante.
• Applique un peu plus de soin sur les pointes.
• Coiffe en vanilles, tresses larges ou chignon doux.

2. Hydrater les longueurs
• Utilise : spray eau + leave-in.
• Cible les longueurs et les pointes, pas seulement le cuir chevelu.
• Fréquence : 2 fois/semaine minimum si les cheveux sèchent vite.

3. Réduire la manipulation
• Garde une coiffure 3 à 7 jours si possible.
• Évite de peigner/recoiffer tous les jours.
• Démêle uniquement sur cheveux assouplis.

4. Massage cuir chevelu
• Utilise : doigts propres, éventuellement une huile légère.
• Durée : 3 à 5 minutes.
• Fréquence : 3 fois/semaine.
• Ne gratte pas avec les ongles.

5. Soin profond
• Masque hydratant si cheveux secs.
• Soin fortifiant doux si casse présente.
• Toujours finir par leave-in + scellage.

6. Suivi réaliste
• Photo 1 fois/mois, mêmes conditions.
• Ne vérifie pas la pousse tous les jours.

${porosityAdvice()}`;
}

function detailedBreakageRoutine() {
  return `Objectif : réduire la casse, renforcer doucement la fibre et garder les cheveux souples.

1. Démêlage doux obligatoire
• Utilise : après-shampooing, masque démêlant ou spray hydratant.
• Fais 4 à 8 sections.
• Commence par les pointes, puis remonte vers les racines.
• Doigts d’abord, puis peigne à dents larges si nécessaire.
• Évite le peigne fin et le démêlage à sec.

2. Hydratation complète
• Utilise : eau/leave-in + crème hydratante + huile légère.
• Applique section par section.
• Insiste sur les zones qui cassent.

3. Soin fortifiant léger
• Utilise : masque protéiné doux ou soin fortifiant.
• Fréquence : 1 fois toutes les 3 à 4 semaines.
• Après protéine : toujours remettre hydratation.
• Signe d’excès : cheveux durs, secs, cassants.

4. Pointes abîmées
• Si les pointes sont fines, transparentes, pleines de nœuds ou cassent sans arrêt : micro-coupe.
• Pas besoin de couper beaucoup.

5. Coiffure protectrice douce
• Vanilles, tresses larges, chignon bas non serré.
• Évite mèches trop lourdes et manipulation quotidienne.

6. Nuit
• Satin obligatoire.
• Ne dors pas avec les cheveux libres s’ils s’emmêlent facilement.

${porosityAdvice()}`;
}

function detailedEdgesRoutine() {
  return `Objectif : protéger les tempes, réduire la tension et apaiser le cuir chevelu.

1. Stop tension
• Évite : tresses serrées, chignon tiré, lace trop collée, gel agressif, élastiques serrés.
• Durée : 4 à 6 semaines de coiffures douces.
• Règle : si ça tire, ce n’est pas protecteur.

2. Hydratation légère des tempes
• Utilise : eau + aloe vera ou leave-in très léger.
• Applique très peu avec les doigts.
• Fréquence : 2 à 3 fois/semaine.

3. Massage doux
• Doigts propres, pulpe des doigts.
• Option : une goutte d’huile légère si ton cuir chevelu l’accepte.
• Durée : 2 à 3 minutes.
• Fréquence : 3 fois/semaine.
• Ne frotte pas fort.

4. Coiffures recommandées
• Vanilles lâches, tresses larges, afro puff très doux, foulard satin.
• Évite les baby hairs plaqués tous les jours.

5. Suivi
• Photo 1 fois/semaine.
• Observe sur 4 à 8 semaines, pas 2 jours.

6. Quand consulter
• Chute soudaine, plaques, douleur, démangeaisons fortes, croûtes : consulte un professionnel.

${porosityAdvice()}`;
}

function detailedSimpleRoutine() {
  return `Objectif : arrêter la confusion et suivre une routine simple avec peu de produits.

Produits minimum à avoir
• 1 shampooing doux.
• 1 masque hydratant.
• 1 leave-in ou crème hydratante.
• 1 huile légère.
• 1 bonnet ou taie satin.

Jour de soin — 1 fois/semaine ou toutes les 2 semaines

1. Shampooing doux
• Applique surtout sur le cuir chevelu.
• Masse avec la pulpe des doigts.
• Laisse la mousse nettoyer les longueurs au rinçage.
• Ne frotte pas les longueurs comme du linge.

2. Masque
• Cheveux secs : masque hydratant.
• Cheveux cassants : soin fortifiant doux de temps en temps.
• Pose 20 à 30 minutes.
• Rince bien.

3. Hydratation
• Leave-in, lait capillaire ou crème hydratante.
• Applique sur cheveux humides, section par section.
• Commence par les pointes.

4. Scellage
• Huile légère ou beurre en petite quantité.
• Applique surtout sur les pointes.

5. Coiffure simple
• Vanilles, tresses simples, chignon doux, afro puff non serré.

Milieu de semaine
• Si cheveux secs : eau + leave-in + un peu d’huile sur les pointes.
• Ne recommence pas toute la routine si ce n’est pas nécessaire.

Nuit
• Bonnet ou taie satin.
• Grosses vanilles si les cheveux s’emmêlent.

${porosityAdvice()}`;
}

function getRecipes() {
  const recipes = [];
  if (state.porosity === "low_porosity") {
    recipes.push(`Recette hydratation légère — faible porosité
• 2 c. à soupe d’aloe vera
• 1 c. à café de miel
• 1 c. à café d’huile de jojoba
Utilisation : applique sur cheveux propres et humides, pose 25 à 30 minutes avec chaleur douce, puis rince.`);
    recipes.push(`Recette douceur sans lourdeur
• 2 c. à soupe de yaourt nature
• 1 c. à soupe de gel de lin
• Quelques gouttes d’huile de pépins de raisin
Utilisation : pose 20 minutes. Idéal si tes cheveux deviennent vite lourds.`);
  } else if (state.porosity === "high_porosity") {
    recipes.push(`Recette hydratation + rétention — forte porosité
• 2 c. à soupe d’aloe vera
• 1 c. à soupe de miel
• 1 c. à soupe d’huile d’olive ou d’avocat
Utilisation : pose 30 minutes, puis rince et scelle rapidement après ton leave-in.`);
    recipes.push(`Recette renforcement doux — casse
• 2 c. à soupe de yaourt nature
• 1 c. à café de miel
• 1 c. à café d’huile de ricin
Utilisation : pose 20 minutes. À faire 1 à 2 fois/mois si les cheveux cassent.`);
  } else {
    recipes.push(`Recette équilibre
• 2 c. à soupe de yaourt nature
• 1 c. à café de miel
• 1 c. à soupe d’huile d’amande douce ou d’olive
Utilisation : pose 25 minutes. Fréquence : 1 fois/semaine ou toutes les 2 semaines.`);
  }

  recipes.push(`Spray romarin doux — cuir chevelu
• 1 tasse d’eau chaude
• 1 c. à soupe de romarin séché
Infuse 15 minutes, filtre, laisse refroidir. Vaporise légèrement 2 à 3 fois/semaine. Conserve au frais 5 à 7 jours.`);

  if (state.scalp === "irritated") {
    recipes.push(`Cuir chevelu sensible
• 2 c. à soupe d’aloe vera
• Quelques gouttes d’huile de jojoba
Applique en petite quantité avant lavage. Évite les huiles essentielles si le cuir chevelu est irrité.`);
  }

  return recipes.join("\n\n");
}

function sevenDayPlan(profile) {
  if (profile.includes("Tempes")) {
    return `Jour 1 : photo de suivi + arrêt des coiffures serrées.
Jour 2 : hydratation légère des tempes.
Jour 3 : massage doux 2 à 3 minutes.
Jour 4 : repos, aucune tension.
Jour 5 : soin hydratant doux.
Jour 6 : coiffure très légère.
Jour 7 : observation + ajustement.`;
  }
  if (profile.includes("Casse") || profile.includes("Pousse")) {
    return `Jour 1 : démêlage doux en sections.
Jour 2 : hydratation + scellage des pointes.
Jour 3 : coiffure protectrice légère.
Jour 4 : massage cuir chevelu 3 à 5 minutes.
Jour 5 : masque hydratant ou fortifiant doux.
Jour 6 : repos manipulation.
Jour 7 : bilan casse + ajustement.`;
  }
  return `Jour 1 : hydratation complète.
Jour 2 : protection des pointes.
Jour 3 : vérification sécheresse.
Jour 4 : massage cuir chevelu.
Jour 5 : masque hydratant.
Jour 6 : scellage léger.
Jour 7 : observation + nouvelle routine.`;
}

function getExpectedResults() {
  return `• Après 2 semaines : cheveux plus souples, démêlage plus facile, moins de sensation rêche.
• Après 1 mois : meilleure rétention d’hydratation, moins de casse visible, routine plus claire.
• Après 2 à 3 mois : meilleure rétention de longueur si la routine est régulière et les pointes protégées.`;
}

function getImprovementSigns() {
  return `• Les cheveux restent doux plus longtemps.
• Moins de petits cheveux cassés lors du démêlage.
• Pointes moins rêches.
• Moins de nœuds.
• Cuir chevelu plus confortable.
• Tu comprends mieux quels produits fonctionnent.`;
}

function getWarnings() {
  const warnings = [];
  warnings.push("• Ne mélange pas trop de recettes dans la même semaine.");
  warnings.push("• Fais un test sur une petite section avant toute nouvelle recette.");
  warnings.push("• Si chute forte, soudaine, douloureuse ou zones clairsemées : consulte un professionnel.");
  if (state.scalp === "irritated") warnings.push("• Évite huiles essentielles et gommages agressifs si ton cuir chevelu est irrité.");
  if (state.heat === "often") warnings.push("• Réduis la chaleur et utilise toujours une protection thermique si tu l’utilises.");
  return warnings.join("\n");
}

function getBonus() {
  if (state.porosity === "low_porosity") return "Pour toi, la clé n’est pas plus de produit, mais meilleure pénétration : cheveux humides, petites sections, chaleur douce.";
  if (state.porosity === "high_porosity") return "Pour toi, la clé est de retenir l’eau : hydrate, puis scelle rapidement, surtout sur les pointes.";
  if (state.mainProblem === "growth") return "Ne poursuis pas seulement la pousse. Protège la longueur que tu as déjà, surtout les pointes.";
  return "Commence simple pendant 14 jours. Observe tes cheveux avant de changer plusieurs choses à la fois.";
}

chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const value = userInput.value.trim();
  if (value) handleUserReply(value);
});

if (resetBtn) resetBtn.addEventListener("click", startChat);
startChat();
