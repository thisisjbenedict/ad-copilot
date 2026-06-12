import { useState } from "react";
import { uploadScript } from "./services/scriptService";
import {
  getUniqueActors,
  getUniqueProps,
  getUniqueCostumes,
  getUniqueLocations,
  getActorScenes,
  getLocationGroups
} from "./utils/projectAggregation";
import "./App.css";

function Metric({ label, value }) {
  return (
    <div className="metric card">
      <div className="num">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function Tab({ id, active, onClick, children }) {
  return (
    <button
      className={"tab" + (active ? " active" : "")}
      onClick={() => onClick(id)}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function ItemCard({ left, title, sub }) {
  return (
    <div className="item-card">
      <div className="item-left">{left}</div>
      <div className="item-main">
        <div className="item-title">{title}</div>
        {sub && <div className="item-sub">{sub}</div>}
      </div>
    </div>
  );
}

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("scenes");

  const scenes = uploadResponse?.analysis?.scenes ?? [];
  const shootPlan = uploadResponse?.analysis ?.shootPlan || [];
  
  const [searchTerm, setSearchTerm] =
  useState("");

const [sortMode, setSortMode] =
  useState("count");

const [expandedActor, setExpandedActor] =
  useState(null);

const [expandedLocation, setExpandedLocation] =
  useState(null);

const [expandedProp, setExpandedProp] =
  useState(null);

const [expandedShootDay, setExpandedShootDay] =
  useState(null);

  const [selectedScene,
  setSelectedScene] =
  useState(null);

  const [expandedSection,
  setExpandedSection] =
  useState(null);

  const actors = getUniqueActors(scenes);
  const props = getUniqueProps(scenes);
  const costumes = getUniqueCostumes(scenes);
  const locations = getUniqueLocations(scenes);
  const locationGroups = getLocationGroups(scenes);

  const sortedActors =
  [...actors]
    .filter(actor =>
      actor
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )
    .sort((a,b)=>{

      if(sortMode==="az")
        return a.localeCompare(b);

      if(sortMode==="za")
        return b.localeCompare(a);

      return (
        getActorScenes(
          scenes,
          b
        ).length -
        getActorScenes(
          scenes,
          a
        ).length
      );

    });

    const getPropScenes = (
  prop,
  scenes
) => {

  return scenes.filter(
    scene =>
      scene.props?.includes(prop)
  );

};


  const handleUpload = async () => {
    setError(null);
    setUploadResponse(null);

    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("script", selectedFile);

    try {
      setIsUploading(true);
      const result = await uploadScript(formData);
      setUploadResponse(result);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const sceneCount = scenes.length;
  const actorCount = actors.length;
  const locationCount = locations.length;
  const propCount = props.length;

  return (
  <div className="app">

    <div className="container">

      <header className="header">

  <div className="hero">

  <h1>Script2Shoot</h1>

  <p className="hero-tagline">
    Transform screenplays into production-ready plans
  </p>

  <p className="subtitle">
    Script Breakdown • Scheduling • Production Planning
  </p>

</div>

<div className="upload-card">

  <div className="file-info">

    {/* <div className="file-icon">
      📄
    </div> */}

    <div>

      <div className="file-name">
        {
          selectedFile
            ? selectedFile.name
            : "Upload screenplay"
        }
      </div>

      {/* <div className="file-status">
        {
          selectedFile
            ? "Ready for AI analysis"
            : "Select a screenplay PDF to begin"
        }
      </div> */}

    </div>

  </div>

  <div className="upload-actions">

    <input
      id="script-upload"
      type="file"
      accept=".pdf"
      hidden
      onChange={(e) =>
        setSelectedFile(
          e.target.files?.[0] || null
        )
      }
    />

    <label
      htmlFor="script-upload"
      className="browse-btn"
    >
      Browse Script
    </label>

    <button
      className="analyze-btn"
      onClick={handleUpload}
      disabled={
        isUploading ||
        !selectedFile
      }
    >
      {
        isUploading
          ? "Analyzing..."
          : "Analyze Script"
      }
    </button>

  </div>

</div>
  
</header>
{sceneCount > 0 && (
  <section className="metrics">

  <Metric
    label="Scenes"
    value={sceneCount}
  />

  <Metric
    label="Actors"
    value={actorCount}
  />

  <Metric
    label="Locations"
    value={locationCount}
  />

  <Metric
    label="Props"
    value={propCount}
  />

</section>
)}
      <section className="tabs">

        <Tab
          id="scenes"
          active={activeTab==="scenes"}
          onClick={setActiveTab}
        >
          Scenes
        </Tab>

        <Tab
          id="actors"
          active={activeTab==="actors"}
          onClick={setActiveTab}
        >
          Actors
        </Tab>

        <Tab
          id="locations"
          active={activeTab==="locations"}
          onClick={setActiveTab}
        >
          Locations
        </Tab>

        <Tab
          id="props"
          active={activeTab==="props"}
          onClick={setActiveTab}
        >
          Props
        </Tab>

        <Tab
          id="shoot"
          active={activeTab==="shoot"}
          onClick={setActiveTab}
        >
          Shoot Plan
        </Tab>

      </section>
      <div className="toolbar">

  <input
    className="search-input"
    type="text"
    placeholder="Search actors, locations, props..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
  />

  <select
    className="sort-select"
    value={sortMode}
    onChange={(e) =>
      setSortMode(e.target.value)
    }
  >
    <option value="count">
      Most Used
    </option>

    <option value="az">
      A → Z
    </option>

    <option value="za">
      Z → A
    </option>
  </select>

</div>

      <main className="content">

        {activeTab === "scenes" && (

  <>

    {scenes.map((scene) => (

      <ItemCard
        key={scene.sceneNumber}
        left={scene.sceneNumber}
        title={
          scene.title ||
          scene.slugline
        }
        sub={
  `📍 ${scene.location}
   • 👥 ${scene.actors.length} actors
   • ⚡ Complexity ${scene.complexityScore}`
}
      />

    ))}

  </>

)}

{activeTab === "actors" && (

  <>

    {sortedActors.map(actor => {

  const actorScenes =
  getActorScenes(
    scenes,
    actor
  );

  return (

    <div
      key={actor}
      className="item-card clickable"
      onClick={() =>
        setExpandedActor(
          expandedActor === actor
            ? null
            : actor
        )
      }
    >

      <div className="item-main">

        <div className="item-title">
          🎭 {actor}
        </div>

        <div className="item-sub">
          Appears in {actorScenes.length} scenes
        </div>

        {
          expandedActor === actor &&
          (
            <div className="tag-container">

              {
                actorScenes.map(scene => (

                  <span
                    key={scene.sceneNumber}
                    className="tag"
                  >
                    Scene {scene.sceneNumber}
                  </span>

                ))
              }

            </div>
          )
        }

      </div>

    </div>

  );

})}

  </>

)}

{activeTab === "locations" && (

  <>

   {locations.map(location => {

  const locationScenes =
    scenes.filter(
      scene =>
        scene.location === location
    );

  return (

    <div
      key={location}
      className="item-card clickable"
      onClick={() =>
        setExpandedLocation(
          expandedLocation === location
            ? null
            : location
        )
      }
    >

      <div className="item-main">

        <div className="item-title">
          📍 {location}
        </div>

        <div className="item-sub">
          Used in {locationScenes.length} scenes
        </div>

        {
          expandedLocation === location &&
          (
            <div className="tag-container">

              {
                locationScenes.map(scene => (

                  <span
                    key={scene.sceneNumber}
                    className="tag"
                    onClick={(e) => {

    e.stopPropagation();

    setSelectedScene(scene);

  }}
                  >
                    Scene {scene.sceneNumber}
                  </span>

                ))
              }

            </div>
          )
        }

      </div>

    </div>

  );

})}

  </>

)}

{activeTab === "props" && (

  <>

    {props.map(prop => {

  const propScenes =
    getPropScenes(
      prop,
      scenes
    );

  return (

    <div
      key={prop}
      className="item-card clickable"
      onClick={() =>
        setExpandedProp(
          expandedProp === prop
            ? null
            : prop
        )
      }
    >

      <div className="item-main">

        <div className="item-title">
          🎬 {prop}
        </div>

        <div className="item-sub">
          Used in {propScenes.length} scenes
        </div>

        {
          expandedProp === prop &&
          (
            <div className="tag-container">

              {
                propScenes.map(scene => (

                  <span
                    key={scene.sceneNumber}
                    className="tag"
                  >
                    Scene {scene.sceneNumber}
                  </span>

                ))
              }

            </div>
          )
        }

      </div>

    </div>

  );

})}

  </>

)}

{activeTab === "shoot" && (

  <div className="shoot-grid">

    {shootPlan.map((day, index) => {

  const dayKey =
    `day-${index}`;

  const expanded =
    expandedShootDay === dayKey;

  return (

    <div
      key={dayKey}
      className="card shoot-card"
    >

      <div
        className="shoot-header"
        onClick={() =>
          setExpandedShootDay(
            expanded
              ? null
              : dayKey
          )
        }
      >

        <h3>
          Day {index + 1}
        </h3>

        <span>
          {day.location}
        </span>

      </div>

      {
        expanded &&
        (
          <>

            {/* SCENES */}

            <div
              className="shoot-section"
              onClick={() =>
                setExpandedSection(
                  expandedSection ===
                  `${dayKey}-scenes`
                    ? null
                    : `${dayKey}-scenes`
                )
              }
            >

              ▼ Scenes

            </div>

            {
              expandedSection ===
              `${dayKey}-scenes`
              &&
              (
                <div className="tag-container">

                  {
                    day.scenes.map(
                      scene => (

                        <span
                          key={
                            scene.sceneNumber
                          }
                          className="tag"
                        >
                          Scene {
                            scene.sceneNumber
                          }
                        </span>

                      )
                    )
                  }

                </div>
              )
            }

            {/* ACTORS */}

            <div
              className="shoot-section"
              onClick={() =>
                setExpandedSection(
                  expandedSection ===
                  `${dayKey}-actors`
                    ? null
                    : `${dayKey}-actors`
                )
              }
            >

              ▼ Actors

            </div>

            {
              expandedSection ===
              `${dayKey}-actors`
              &&
              (
                <div className="tag-container">

                  {
                    [
                      ...new Set(
                        day.scenes.flatMap(
                          scene =>
                            scene.actors || []
                        )
                      )
                    ].map(actor => (

                      <span
                        key={actor}
                        className="tag"
                      >
                        {actor}
                      </span>

                    ))
                  }

                </div>
              )
            }

            {/* PROPS */}

            <div
              className="shoot-section"
              onClick={() =>
                setExpandedSection(
                  expandedSection ===
                  `${dayKey}-props`
                    ? null
                    : `${dayKey}-props`
                )
              }
            >

              ▼ Props

            </div>

            {
              expandedSection ===
              `${dayKey}-props`
              &&
              (
                <div className="tag-container">

                  {
                    [
                      ...new Set(
                        day.scenes.flatMap(
                          scene =>
                            scene.props || []
                        )
                      )
                    ].map(prop => (

                      <span
                        key={prop}
                        className="tag"
                      >
                        {prop}
                      </span>

                    ))
                  }

                </div>
              )
            }

          </>
        )
      }

    </div>

  );

})}

  </div>

)}

<aside className="inspector">

    {selectedScene ? (

      <>
        <h3>
          Scene {selectedScene.sceneNumber}
        </h3>

        <p className="inspector-title">
          {selectedScene.title}
        </p>

        <div className="inspector-block">
          <strong>Location</strong>
          <p>{selectedScene.location}</p>
        </div>

        <div className="inspector-block">
          <strong>Complexity</strong>
          <p>
            {selectedScene.complexityScore}/10
          </p>
        </div>

        <div className="inspector-block">
          <strong>Actors</strong>

          <div className="tag-container">
            {selectedScene.actors?.map(actor => (
              <span
                key={actor}
                className="tag"
              >
                {actor}
              </span>
            ))}
          </div>
        </div>

        <div className="inspector-block">
          <strong>Props</strong>

          <div className="tag-container">
            {selectedScene.props?.map(prop => (
              <span
                key={prop}
                className="tag"
              >
                {prop}
              </span>
            ))}
          </div>
        </div>

      </>

    ) : (

      <div className="empty-inspector">

        <h3>Scene Inspector</h3>

        <p>
          Select a scene tag to inspect
          details.
        </p>

      </div>

    )}

  </aside>

      </main>

    </div>

  </div>
);
}

export default App;