import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>OSM UI Pages</h1>

      <ul>
        <li>
          <Link to="/login">
            Login Page
          </Link>
        </li>

        <li>
          <Link to="/instruction">
            Instruction Page
          </Link>
        </li>

        <li>
          <Link to="/day-report">
            Day Wise Report
          </Link>
        </li>

        <li>
          <Link to="/script-report">
            Evaluator Script Report
          </Link>
        </li>

        {/* Add this */}
        <li>
          <Link to="/main-assessment">
            Main Assessment
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Home;