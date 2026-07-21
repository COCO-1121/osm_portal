import { useState, useEffect } from "react";

export default function UserInfo() {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("examinerUserId");
    const storedUserName = localStorage.getItem("examinerName");
    
    if (storedUserId) setUserId(storedUserId);
    if (storedUserName) setUserName(storedUserName);
  }, []);
  return (
    <div className="bg-white rounded shadow p-4 flex justify-between items-center">

      <div>
        User ID :
        <span className="font-bold ml-2">
          {userId || "N/A"}
        </span>
      </div>

      <div>
        User Name :
        <span className="font-bold ml-2">
          {userName || "N/A"}
        </span>
      </div>

    </div>
  );
}