import { useState, useRef, useEffect } from "react";
import { uploadScript } from "./services/scriptService";
import { API_URL } from "./config/api";

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

const [expandedShootSection, setExpandedShootSection] =
  useState({});

  const [currentPage,
setCurrentPage] =
useState(1);

  const ITEMS_PER_PAGE = {
  scenes: 10,
  actors: 12,
  locations: 12,
  props: 12
};

  const toggleShootSection = (
  dayId,
  section
) => {

  const key =
    `${dayId}-${section}`;

  setExpandedShootSection(
    expandedShootSection === key
      ? null
      : key
  );

};

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

  const getComplexityClass = (
  score
) => {

  if (score <= 3)
    return "easy";

  if (score <= 6)
    return "medium";

  return "hard";
};

const getDaySummary = (day) => {

  const actors =
    [...new Set(
      day.scenes.flatMap(
        s => s.actors || []
      )
    )];

  const props =
    [...new Set(
      day.scenes.flatMap(
        s => s.props || []
      )
    )];

  const permissions =
    [...new Set(
      day.scenes.flatMap(
        s =>
          s.specialRequirements || []
      )
    )];

  const avgComplexity =
    Math.round(
      day.scenes.reduce(
        (sum, scene) =>
          sum +
          (scene.complexityScore || 0),
        0
      ) / day.scenes.length
    );

  return {
    actors,
    props,
    permissions,
    avgComplexity,
  };

};
  const toggleDaySection = (
  dayNumber,
  section
) => {

  const key =
    `${dayNumber}-${section}`;

  setExpandedShootSection(
    prev => ({
      ...prev,
      [key]: !prev[key]
    })
  );

};
  

 const [selectedScene,
setSelectedScene] =
useState(null);

  const [expandedSection,
  setExpandedSection] =
  useState(null);


  const loadingMessages = [
  "Reading screenplay...",
  "Extracting scenes...",
  "Identifying actors...",
  "Detecting locations...",
  "Finding props...",
  "Calculating scene complexity...",
  "Generating shoot plan...",
  "Finalizing production report..."
];


  const changeTab = (tabId) => {

  setActiveTab(tabId);
  setCurrentPage(1);

  setSelectedScene(null);

  setExpandedActor(null);

  setExpandedLocation(null);

  setExpandedProp(null);

  setExpandedShootDay(null);

  setExpandedSection(null);

  if(tabId === "scenes")
    setSortMode("scriptOrder");
  else
    setSortMode("count");

};

const paginate = (
  items,
  page,
  pageSize
) => {

  const start =
    (page - 1) *
    pageSize;

  return items.slice(
    start,
    start + pageSize
  );

};

const [loadingStep, setLoadingStep] =
  useState(0);

  useEffect(() => {

  if (!isUploading) {
    setLoadingStep(0);
    return;
  }

  const interval = setInterval(() => {

    setLoadingStep(
      prev =>
        (prev + 1) %
        loadingMessages.length
    );

  }, 1800);

  return () =>
    clearInterval(interval);

}, [isUploading]);

  const actors = getUniqueActors(scenes);
  const props = getUniqueProps(scenes);
  const costumes = getUniqueCostumes(scenes);
  const locations = getUniqueLocations(scenes);
  const locationGroups = getLocationGroups(scenes);
const filteredLocations =
  [...locations]
    .filter(location =>
      location
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )
    .sort((a,b) => {

      const aCount =
        scenes.filter(
          scene =>
            scene.location === a
        ).length;

      const bCount =
        scenes.filter(
          scene =>
            scene.location === b
        ).length;

      if(sortMode === "az")
        return a.localeCompare(b);

      if(sortMode === "za")
        return b.localeCompare(a);

      return bCount - aCount;

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

    const filteredProps =
  [...props]
    .filter(prop =>
      prop
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )
    .sort((a,b)=>{

      const aCount =
        getPropScenes(
          a,
          scenes
        ).length;

      const bCount =
        getPropScenes(
          b,
          scenes
        ).length;

      if(sortMode==="az")
        return a.localeCompare(b);

      if(sortMode==="za")
        return b.localeCompare(a);

      return bCount - aCount;

    });

    const filteredScenes =
  [...scenes]
    .filter(scene => {

      const q =
        searchTerm
          .toLowerCase();

      return (

        scene.title
          ?.toLowerCase()
          .includes(q)

        ||

        scene.location
          ?.toLowerCase()
          .includes(q)

        ||

        scene.actors
          ?.some(actor =>
            actor
              .toLowerCase()
              .includes(q)
          )

      );

    })
    .sort((a,b)=>{

  if(sortMode==="complexityDesc")
    return (
      b.complexityScore -
      a.complexityScore
    );

  if(sortMode==="complexityAsc")
    return (
      a.complexityScore -
      b.complexityScore
    );

  return (
    a.sceneNumber -
    b.sceneNumber
  );

});

  
    const filteredShootPlan =
  shootPlan.filter(day =>

    day.location
      ?.toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )

  );

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

  const fileInputRef = useRef(null);
  const clearSelectedFile = () => {
  setSelectedFile(null);
  setUploadResponse(null);
  setError(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
  const hasAnalysis =
  scenes.length > 0;
  const sceneCount = scenes.length;
  const actorCount = actors.length;
  const locationCount = locations.length;
  const propCount = props.length;


const paginatedScenes =
  paginate(
    filteredScenes,
    currentPage,
    10
  );

  const paginatedActors =
  paginate(
    sortedActors,
    currentPage,
    12
  );

  const paginatedLocations =
  paginate(
    filteredLocations,
    currentPage,
    12
  );

  const paginatedProps =
  paginate(
    filteredProps,
    currentPage,
    12
  );

  const activeItems =

  activeTab === "scenes"
    ? filteredScenes

  : activeTab === "actors"
    ? sortedActors

  : activeTab === "locations"
    ? filteredLocations

  : filteredProps;

const pageSize =

  activeTab === "scenes"
    ? 10
    : 12;

const totalPages =
  Math.ceil(
    activeItems.length /
    pageSize
  );

  const downloadPdf =
  async () => {

    window.open(
      `${API_URL}/export-pdf`,
       "_blank"
    );

  };
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

  <div className="upload-info">

    <div className="upload-title">
      {
        selectedFile
          ? selectedFile.name
          : "Upload screenplay PDF"
      }
    </div>

    <div className="upload-subtitle">
      {
        selectedFile
          ? "Ready for AI analysis"
          : "Select a screenplay to generate breakdowns"
      }
    </div>

  </div>

  <div className="upload-actions">

    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf"
      id="script-upload"
      hidden
      onChange={(e) =>
        setSelectedFile(
          e.target.files?.[0] || null
        )
      }
    />

    <label
      htmlFor="script-upload"
      className="secondary-btn"
    >
      {
        selectedFile
          ? "Change File"
          : "Browse Script"
      }
    </label>

    <button
      className="primary-btn"
      disabled={
        !selectedFile || isUploading
      }
      title={
        !selectedFile
          ? "Select a screenplay PDF first"
          : ""
      }
      onClick={handleUpload}
    >
      {
        isUploading
          ? "Analyzing..."
          : "Analyze Script"
      }
    </button>


{hasAnalysis && (<button
  onClick={downloadPdf}
>
  Export PDF
</button>)}

    {
      selectedFile && (
        <button
          className="danger-btn"
          onClick={clearSelectedFile}
        >
          ✕
        </button>
      )
    }

  </div>

</div>

{
  !hasAnalysis && (
    <div className="empty-state">

      <div className="empty-icon">
        🎬
      </div>

      <h3>
        Upload a screenplay to begin
      </h3>

      <p>
        Script2Shoot will extract scenes,
        actors, props, locations and
        generate a suggested shoot plan.
      </p>

    </div>
  )
}
  
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
{ hasAnalysis &&(

      <div className="tabs-toolbar">
        <section className="tabs">

        <Tab
          id="scenes"
          active={activeTab==="scenes"}
          onClick={changeTab}
        >
          Scenes
        </Tab>

        <Tab
          id="actors"
          active={activeTab==="actors"}
          onClick={changeTab}
        >
          Actors
        </Tab>

        <Tab
          id="locations"
          active={activeTab==="locations"}
          onClick={changeTab}
        >
          Locations
        </Tab>

        <Tab
          id="props"
          active={activeTab==="props"}
          onClick={changeTab}
        >
          Props
        </Tab>

        <Tab
          id="shoot"
          active={activeTab==="shoot"}
          onClick={changeTab}
        >
          Shoot Plan
        </Tab>

      </section>
      {activeTab !== "shoot" 
        &&(
          <div className="toolbar">
<input
      type="text"
      className="search-input"
      placeholder={
        activeTab === "actors"
          ? "Search actors..."
          : activeTab === "locations"
          ? "Search locations..."
          : activeTab === "props"
          ? "Search props..."
          : "Search..."
      }
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(
          e.target.value
        )
      }
    />

    <select
      className="sort-select"
      value={sortMode}
      onChange={(e) =>
        setSortMode(
          e.target.value
        )
      }
    >
       {activeTab === "scenes" ? (
    <>
      <option value="scriptOrder">
        Scene Order
      </option>

      <option value="complexityDesc">
        Complexity ↓
      </option>

      <option value="complexityAsc">
        Complexity ↑
      </option>
    </>
  ) : (
    <>
      <option value="count">
        Most Used
      </option>

      <option value="az">
        A-Z
      </option>

      <option value="za">
        Z-A
      </option>
    </>
  )}

    </select>
  </div>
        )
      }
      </div>
)}

      {hasAnalysis && (
        <main className="content">
{activeTab === "scenes" && (

  <>

    {paginatedScenes.map(scene => (

      <div
        key={scene.sceneNumber}
        className="item-card clickable"
        onClick={() =>
          setExpandedSection(
            expandedSection === scene.sceneNumber
              ? null
              : scene.sceneNumber
          )
        }
      >

        <div className="item-left">
          {scene.sceneNumber}
        </div>

        <div className="item-main">

          <div className="item-title">
            {scene.title}
          </div>

          <div className="item-sub">

            📍 {scene.location}
            {" • "}
            👥 {scene.actors.length} actors
            {" • "}
            ⚡ {scene.complexityScore}/10

          </div>

          {
            expandedSection ===
            scene.sceneNumber && (

              <div className="scene-detail-card">

                {scene.actors?.length > 0 && (
                  <>
                    <h4>Actors</h4>

                    <div className="tag-container">

                      {scene.actors.map(actor => (

                        <span
                          key={actor}
                          className="tag"
                        >
                          {actor}
                        </span>

                      ))}

                    </div>
                  </>
                )}

                {scene.props?.length > 0 && (
                  <>
                    <h4>Props</h4>

                    <div className="tag-container">

                      {scene.props.map(prop => (

                        <span
                          key={prop}
                          className="tag"
                        >
                          {prop}
                        </span>

                      ))}

                    </div>
                  </>
                )}

                {scene.specialRequirements?.length > 0 && (
                  <>
                    <h4>Requirements</h4>

                    <div className="tag-container">

                      {scene.specialRequirements.map(req => (

                        <span
                          key={req}
                          className="tag"
                        >
                          {req}
                        </span>

                      ))}

                    </div>
                  </>
                )}

              </div>

            )
          }

        </div>

      </div>

    ))}

  </>

)}

{activeTab === "actors" && (

  <>

    {paginatedActors.map(actor => {

  const actorScenes =
  getActorScenes(
    scenes,
    actor
  );

  return (

    <div
      key={actor}
      className="item-card clickable"
      onClick={() =>{

         setSelectedScene(null);

        setExpandedActor(
          expandedActor === actor
            ? null
            : actor
        )
      }
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
  expandedActor === actor && (
    <>

      <div className="tag-container">

        {actorScenes.map(scene => (

          <span
            key={scene.sceneNumber}
            className="tag clickable-tag"
            onClick={(e) => {

              e.stopPropagation();

              setSelectedScene(
  selectedScene?.sceneNumber ===
  scene.sceneNumber
    ? null
    : scene
);

            }}
          >
            Scene {scene.sceneNumber}
          </span>

        ))}

      </div>

      {selectedScene && (

        <div className="scene-detail-card">

          {actorScenes
            .filter(
              scene =>
                scene.sceneNumber === selectedScene?.sceneNumber
            )
            .map(scene => (

              <div
                key={scene.sceneNumber}
              >

                <h4>{scene.title}</h4>

                <p>
                  📍 {scene.location}
                </p>

                <p>
                  Complexity:
                  {scene.complexityScore}
                </p>

              </div>

            ))}

        </div>

      )}

    </>
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

   {paginatedLocations.map(location => {

  const locationScenes =
    scenes.filter(
      scene =>
        scene.location === location
    );

  return (

    <div
      key={location}
      className="item-card clickable"
      onClick={() =>{

        setSelectedScene(null);
        setExpandedLocation(
          expandedLocation === location
            ? null
            : location
        )
      }
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
  expandedLocation === location && (
    <>

      <div className="tag-container">

        {locationScenes.map(scene => (

          <span
            key={scene.sceneNumber}
            className="tag clickable-tag"
            onClick={(e) => {

              e.stopPropagation();

              setSelectedScene(
                selectedScene?.sceneNumber ===
                scene.sceneNumber
                  ? null
                  : scene
              );

            }}
          >
            Scene {scene.sceneNumber}
          </span>

        ))}

      </div>

      {
        selectedScene &&
        locationScenes.some(
          s =>
            s.sceneNumber ===
            selectedScene.sceneNumber
        ) && (

          <div className="scene-detail-card">

            <h4>
              {selectedScene.title}
            </h4>

            <p>
              📍 {selectedScene.location}
            </p>

            <p>
              Complexity:
              {" "}
              {selectedScene.complexityScore}
            </p>

          </div>

        )
      }

    </>
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

    {paginatedProps.map(prop => {

  const propScenes =
    getPropScenes(
      prop,
      scenes
    );

  return (

    <div
      key={prop}
      className="item-card clickable"
      onClick={() =>{

        setSelectedScene(null);
        setExpandedProp(
          expandedProp === prop
            ? null
            : prop
        )
      }
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
  expandedProp === prop && (
    <>

      <div className="tag-container">

        {propScenes.map(scene => (

          <span
            key={scene.sceneNumber}
            className="tag clickable-tag"
            onClick={(e) => {

              e.stopPropagation();

              setSelectedScene(
                selectedScene?.sceneNumber ===
                scene.sceneNumber
                  ? null
                  : scene
              );

            }}
          >
            Scene {scene.sceneNumber}
          </span>

        ))}

      </div>

      {
        selectedScene &&
        propScenes.some(
          s =>
            s.sceneNumber ===
            selectedScene.sceneNumber
        ) && (

          <div className="scene-detail-card">

            <h4>
              {selectedScene.title}
            </h4>

            <p>
              📍 {selectedScene.location}
            </p>

            <p>
              Complexity:
              {" "}
              {selectedScene.complexityScore}
            </p>

          </div>

        )
      }

    </>
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

    {filteredShootPlan.map(day => {

      const summary =
        getDaySummary(day);

      return (

        <div
          key={day.day}
          className="shoot-day-card"
        >

          <div className="day-header">

            <h2>
              DAY {day.day}
            </h2>

            <p className="day-location">
              📍 {day.location}
            </p>

          </div>

          <div className="day-stats">

            <span className="day-stat">
  🎬 {day.scenes.length} Scenes
</span>

            {summary.actors.length > 0 && (
              <span>
                👥 {summary.actors.length} Actors
              </span>
            )}

            {summary.props.length > 0 && (
              <span>
                📦 {summary.props.length} Props
              </span>
            )}

<span
  className={`day-stat complexity ${getComplexityClass(
    summary.avgComplexity
  )}`}
>
  ⚡ {summary.avgComplexity}/10
</span>

          </div>

          {/* SCENES */}

          <button
            className="collapse-row"
            onClick={() =>
              toggleDaySection(
                day.day,
                "scenes"
              )
            }
          >
            🎬 Scenes
            ({day.scenes.length})
          </button>

          {expandedShootSection?.[
  `${day.day}-scenes`
] && (

  <>

    <div className="collapse-content">

      {day.scenes.map(scene => (

        <span
          key={scene.sceneNumber}
          className="tag clickable-tag"
          onClick={() =>

            setSelectedScene(

              selectedScene?.sceneNumber ===
              scene.sceneNumber

                ? null

                : scene

            )

          }
        >
          Scene {scene.sceneNumber}
        </span>

      ))}

    </div>

    {
      selectedScene &&
      day.scenes.some(
        s =>
          s.sceneNumber ===
          selectedScene.sceneNumber
      ) && (

        <div className="scene-detail-card">

          <h4>
            {selectedScene.title}
          </h4>

          <p>
            📍 {selectedScene.location}
          </p>

          <p>
            Complexity:
            {" "}
            {selectedScene.complexityScore}
          </p>

        </div>

      )
    }

  </>

)}
          

          {/* ACTORS */}

          {summary.actors.length > 0 && (

            <>

              <button
                className="collapse-row"
                onClick={() =>
                  toggleDaySection(
                    day.day,
                    "actors"
                  )
                }
              >
                👥 Actors
                ({summary.actors.length})
              </button>

              {expandedShootSection?.[
                `${day.day}-actors`
              ] && (

                <div className="collapse-content">

                  {summary.actors.map(
                    actor => (

                      <span
                        key={actor}
                        className="tag"
                      >
                        {actor}
                      </span>

                    )
                  )}

                </div>

              )}

            </>

          )}

          {/* PROPS */}

          {summary.props.length > 0 && (

            <>

              <button
                className="collapse-row"
                onClick={() =>
                  toggleDaySection(
                    day.day,
                    "props"
                  )
                }
              >
                📦 Props
                ({summary.props.length})
              </button>

              {expandedShootSection?.[
                `${day.day}-props`
              ] && (

                <div className="collapse-content">

                  {summary.props.map(
                    prop => (

                      <span
                        key={prop}
                        className="tag"
                      >
                        {prop}
                      </span>

                    )
                  )}

                </div>

              )}

            </>

          )}

          {/* PERMISSIONS */}

          {summary.permissions.length > 0 && (

            <>

              <button
                className="collapse-row"
                onClick={() =>
                  toggleDaySection(
                    day.day,
                    "permissions"
                  )
                }
              >
                ⚠ Requirements
                ({summary.permissions.length})
              </button>

              {expandedShootSection?.[
                `${day.day}-permissions`
              ] && (

                <div className="collapse-content">

                  {summary.permissions.map(
                    item => (

                      <span
                        key={item}
                        className="tag"
                      >
                        {item}
                      </span>

                    )
                  )}

                </div>
                

              )}

            </>

          )}

          {/* AI NOTE */}

          <div className="ai-note">

            <strong>
              🤖 AI Suggestion
            </strong>

            <p>

  {summary.avgComplexity <= 3 &&
    "Low complexity shoot. Suitable for a smaller crew."}

  {summary.avgComplexity > 3 &&
   summary.avgComplexity <= 6 &&
    "Moderate production requirements. Plan equipment and crew in advance."}

  {summary.avgComplexity > 6 &&
    "High complexity shoot. Additional coordination recommended."}

</p>

          </div>

        </div>

      );

    })}

  </div>

)}

{activeTab !== "shoot" && totalPages > 1 && (

  <div className="pagination">

    <button
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(
          p => p - 1
        )
      }
    >
      ← Previous
    </button>

    <span>
      Page {currentPage}
      {" / "}
      {totalPages}
    </span>

    <button
      disabled={
        currentPage === totalPages
      }
      onClick={() =>
        setCurrentPage(
          p => p + 1
        )
      }
    >
      Next →
    </button>

  </div>

)}

      </main>
      )}

      {
  isUploading && (

    <div className="loading-overlay">

      <div className="loading-card">

        <div className="spinner"></div>

        <h3>
          AI Production Analysis
        </h3>

        <p className="loading-message">
          {
            loadingMessages[
              loadingStep
            ]
          }
        </p>

        <div className="loading-progress">

          {
            loadingMessages.map(
              (msg, index) => (

                <div
                  key={msg}
                  className={
                    index <= loadingStep
                      ? "progress-dot active"
                      : "progress-dot"
                  }
                />

              )
            )
          }

        </div>

      </div>

    </div>

  )
}

    </div>

  </div>
);
}

export default App;