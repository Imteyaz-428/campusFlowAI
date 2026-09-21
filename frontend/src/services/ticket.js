import api from "./api";


// STUDENT — CREATE TICKET


export const createTicket = async (data) => {
  const response = await api.post(
    "/campus/tickets/",
    data
  );

  return response.data;
};



// STUDENT — GET MY TICKETS


export const getMyTickets = async () => {
  const response = await api.get(
    "/campus/tickets/my"
  );

  return response.data;
};



// ADMIN / TEACHER — GET ALL TICKETS


export const getAllTickets = async (params = {}) => {
  const response = await api.get(
    "/campus/tickets/",
    {
      params,
    }
  );

  return response.data;
};



// GET TICKET BY ID


export const getTicket = async (ticketId) => {
  const response = await api.get(
    `/campus/tickets/${ticketId}`
  );

  return response.data;
};



// GET TICKET BY NUMBER


export const getTicketByNumber = async (
  ticketNumber
) => {
  const response = await api.get(
    `/campus/tickets/number/${ticketNumber}`
  );

  return response.data;
};



// ADMIN / TEACHER — UPDATE TICKET


export const updateTicket = async (
  ticketId,
  data
) => {
  const response = await api.put(
    `/campus/tickets/${ticketId}`,
    data
  );

  return response.data;
};