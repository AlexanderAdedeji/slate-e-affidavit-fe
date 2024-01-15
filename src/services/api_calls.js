import axios from "axios";

const URL = "https://slate-eaffidavit.onrender.com";

export const fetchDocuments = async () => {
  return await axios.get(`${URL}/get_documents`);
};

export const fetchTemplates = async () => {
  return await axios.get(`${URL}/get_templates`);
};

export const fetchSingleDocument = async (id) => {
  return await axios.get(`${URL}/get_single_document/${id}`,);
};

export const fetchSingleTemplate = async (id) => {
  return await axios.get(`${URL}/get_single_template/${id}`);
};
export const createTemplate = async (data) => {
  return await axios.post(`${URL}/create_template`, data);
};

export const createDocument = async (data) => {
  return await axios.post(`${URL}/create_document`, data);
};
