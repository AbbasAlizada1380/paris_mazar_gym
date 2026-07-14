import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { signOutSuccess } from "../auth/userSlice/userSlice";

export function getTokenExpiration(token) {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export default function PrivateRoute() {
  const dispatch = useDispatch();
  const { accessToken: reduxToken } = useSelector((state) => state.user);

  // ✅ Fallback: read token from localStorage if Redux state is empty
  const storedAuth = JSON.parse(localStorage.getItem("authData"));
  const accessToken = reduxToken || storedAuth?.accessToken;

  if (!accessToken) {
    return <Navigate to="/sign-in" replace />;
  }

  const expiresAtMs = getTokenExpiration(accessToken);
  const now = Date.now();

  // If token expired → logout immediately
  if (!expiresAtMs || now >= expiresAtMs) {
    dispatch(signOutSuccess());
    return <Navigate to="/sign-in" replace />;
  }

  // Auto logout at token expiration
  useEffect(() => {
    const timeLeft = expiresAtMs - Date.now();

    const timer = setTimeout(() => {
      dispatch(signOutSuccess());
      window.location.replace("/sign-in");
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [dispatch, expiresAtMs]);

  return <Outlet />;
}


// export default function PrivateRoute() {
//   const dispatch = useDispatch();
//   const { accessToken } = useSelector((state) => state.user);

//   if (!accessToken) {
//     return <Navigate to="/sign-in" replace />;
//   }

//   // ----------------------------------------
//   // 🔥 FIXED LOGOUT DATE & TIME
//   // Wednesday, 17 December 2025 at 2:23 PM
//   const logoutAt = new Date("2025-12-17T14:26:00");
//   // ----------------------------------------

//   const now = new Date();

//   console.log("Logout scheduled at:", logoutAt.getTime());

//   // If current time is past the logout time → force logout
//   if (now >= logoutAt) {
//     dispatch(signOutSuccess());
//     return <Navigate to="/sign-in" replace />;
//   }

//   // AUTO LOGOUT EXACTLY AT FIXED DATE/TIME
//   useEffect(() => {
//     const timeLeft = logoutAt - new Date();

//     const timer = setTimeout(() => {
//       dispatch(signOutSuccess());
//       window.location.href = "/sign-in";
//     }, timeLeft);

//     return () => clearTimeout(timer);
//   }, [dispatch]);

//   return <Outlet />;
// }

// dashboard/access/PrivateRoute.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// const PrivateRoute = () => {
//   const { userData, accessToken } = useSelector((state) => state.user);

  

//   // Not logged in → redirect
//   if (!userData && !accessToken) {
//     return <Navigate to="/" replace />;
//   }

//   // Logged in → allow access
//   return <Outlet />;
// };

// export default PrivateRoute;
