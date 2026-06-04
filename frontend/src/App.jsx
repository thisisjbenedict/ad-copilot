import {useState} from "react";
import axios from "axios";
import api from "./services/api";
import { getHealth } from "./services/healthservice";

function App() {
  const [response, setResponse] = useState(null);

  const checkBackend = async () => {
    try {
      const healthData = await getHealth();
      setResponse(healthData);
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div>
      <h1>AD Copilot</h1>

      <button onClick={checkBackend}>
        Check Backend
      </button>

      {response && (
        <pre>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;