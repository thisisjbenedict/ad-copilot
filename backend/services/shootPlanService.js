const normalizeLocation = (
  location = ""
) => {

  const lower =
    location.toLowerCase();

  if (
    lower.includes("ctf") ||
    lower.includes("clothesthatfit")
  ) {
    return "ClothesThatFit.com HQ";
  }

  if (
    lower.includes("ben")
  ) {
    return "Ben's House";
  }

  return location

    .replace(
      /\s*-\s*(day|night|morning|afternoon|evening).*$/i,
      ""
    )

    .trim();
};

const generateShootPlan = (
  scenes = []
) => {

  const grouped = {};

  scenes.forEach(scene => {

  const location =
    normalizeLocation(
      scene.location ||
      "Unknown"
    );

  if (!grouped[location]) {

    grouped[location] = [];

  }

  grouped[location].push(scene);

});

  return Object
    .entries(grouped)

    .sort(
      (a, b) =>
        b[1].length -
        a[1].length
    )

    .map(
      ([location, scenes], index) => {

        const avgComplexity =
          Number(
            (
              scenes.reduce(
                (sum, scene) =>
                  sum +
                  (scene.complexityScore || 0),
                0
              ) /
              scenes.length
            ).toFixed(1)
          );

        const actors = [
          ...new Set(
            scenes.flatMap(
              scene =>
                scene.actors || []
            )
          )
        ];

        const props = [
          ...new Set(
            scenes.flatMap(
              scene =>
                scene.props || []
            )
          )
        ];

        const costumes = [
          ...new Set(
            scenes.flatMap(
              scene =>
                scene.costumes || []
            )
          )
        ];

        const requirements = [
          ...new Set(
            scenes.flatMap(
              scene =>
                scene.specialRequirements ||
                []
            )
          )
        ];

        let recommendation =
          `Shoot ${scenes.length} scene(s) at a single location to reduce company moves.`;

        if (avgComplexity >= 7) {

          recommendation +=
            " High complexity day. Plan additional crew and preparation time.";

        }

        if (requirements.length > 0) {

          recommendation +=
            ` ${requirements.length} special production requirement(s) identified.`;

        }

        if (index === 0) {

          recommendation +=
            " Largest location cluster.";

        }

        let riskLevel = "Low";

if (avgComplexity >= 4) {
  riskLevel = "Medium";
}

if (avgComplexity >= 7) {
  riskLevel = "High";
}

        return {

          day: index + 1,

          location,

          riskLevel,

          scenes,

          sceneNumbers:
            scenes.map(
              scene =>
                scene.sceneNumber
            ),

          totalScenes:
            scenes.length,

          averageComplexity:
            avgComplexity,

          recommendation,

          requirements,

          actors,

          props,

          costumes,

        };

      }
    );

};

module.exports = {
  generateShootPlan
};