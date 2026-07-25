import { getDocuments } from "./document";
import { getUsers } from "./user";
import { getSessions } from "./chat";
import { me } from "./auth";

export const getDashboardData = async () => {
  const currentUser = await me();

  const documents = await getDocuments();

  const sessions = await getSessions();

  let users = [];

  if (currentUser.role === "admin") {
    users = await getUsers();
  }

  return {
    documents,
    users,
    sessions,
    currentUser,
  };
};