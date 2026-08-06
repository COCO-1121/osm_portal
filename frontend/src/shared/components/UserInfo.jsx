import { useState, useEffect } from "react";

export default function UserInfo() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Retrieve User ID from session or localStorage
    const id = localStorage.getItem("examinerUserId") || localStorage.getItem("examiner_id") || "EXM001";
    setUserId(id);

    // Retrieve Evaluator Name from Bank Details / Profile or stored session
    const bankDetailsStr = localStorage.getItem("examiner_bank_details");
    let name = localStorage.getItem("examinerName");

    if (bankDetailsStr) {
      try {
        const parsed = JSON.parse(bankDetailsStr);
        if (parsed.evaluatorName) name = parsed.evaluatorName;
      } catch (e) {
        console.error("Error parsing bank details", e);
      }
    }

    setUserName(name || "Evaluator");
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 flex justify-between items-center">

      <div>
        User ID :
        <span className="font-bold ml-2">
          {userId}
        </span>
      </div>

      <div>
        User Name :
        <span className="font-bold ml-2">
          {userName}
        </span>
      </div>

    </div>
  );
}