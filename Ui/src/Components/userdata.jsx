// useUser.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

 const useUser = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/getuser", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        navigate("/");
      }
    };

    getUser();
  }, [navigate]);

  return user;
};
export default useUser