import { DateUtils } from "../utils/DateUtils";
const STORAGE_PREFIX = "payload_checker_saves";
const DATE = new DateUtils();

export function loadStorageFromClient() {
  return localStorage.getItem(STORAGE_PREFIX);
}

export function saveProject(project) {
  const clientStorageSave = loadStorageFromClient();
  const currentDate = DATE.newFormatedDate('DD-MM-yyyy hh:mm:ss');
  let newSave;

  if (clientStorageSave) {
    newSave = JSON.parse(clientStorageSave);
    const projectAlreadyExists = newSave.projects.find(p => p.uuid === project.uuid);
    if (projectAlreadyExists) { newSave.projects = newSave.projects.filter(p => p.uuid !== projectAlreadyExists.uuid) };
    project.last_update = currentDate;
    newSave.projects.push(project);

  } else {
    project.created_at = currentDate;
    project.last_update = currentDate;
    newSave = { created_at: currentDate, projects: [project] };
  }

  newSave.selectedProject = project.uuid;
  newSave.last_update = currentDate;
  localStorage.setItem(STORAGE_PREFIX, JSON.stringify(newSave));
}

export function deleteProject(projectId) {
  const clientStorageSave = JSON.parse(loadStorageFromClient());
  console.log(`# Client Storage Save:`);
  console.log(clientStorageSave);
  if (clientStorageSave) {
    clientStorageSave.projects = clientStorageSave.projects.filter(p => p.uuid !== projectId);
    clientStorageSave.selectedProject = null;
    localStorage.setItem(STORAGE_PREFIX, JSON.stringify(clientStorageSave));
  }
}

export function saveInformation(information) {
  localStorage.setItem(JSON.stringify(information));
}

export function setCurrentProject(projectId) {
  const clientStorageSave = loadStorageFromClient();
  if (clientStorageSave) clientStorageSave.selectedProject = projectId;
}

