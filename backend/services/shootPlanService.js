const generateShootPlan = (
  scenes = []
) => {

  const grouped = {};
  const uniqueActors = [
  ...new Set(
    scenes.flatMap(
      scene => scene.actors || []
    )
  )
];

const uniqueProps = [
  ...new Set(
    scenes.flatMap(
      scene => scene.props || []
    )
  )
];

const uniqueCostumes = [
  ...new Set(
    scenes.flatMap(
      scene => scene.costumes || []
    )
  )
];

  scenes.forEach(scene => {

    const location =
      scene.location ||
      "Unknown";

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
        (
          scenes.reduce(
            (sum, scene) =>
              sum +
              (scene.complexityScore || 0),
            0
          ) /
          scenes.length
        ).toFixed(1);

      let recommendation =
        "Grouped to reduce travel";

      if (index === 0) {
        recommendation =
          "Largest location cluster";
      }

      return {

        day: index + 1,

        location,

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
        
        actors: uniqueActors,
props: uniqueProps,
costumes: uniqueCostumes,

      };

    }
  );

};

module.exports = {
  generateShootPlan
};