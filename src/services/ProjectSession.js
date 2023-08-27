import { DateUtils } from "../utils/DateUtils";
const STORAGE_PREFIX = "payload_checker_saves";
const DATE = new DateUtils();

export function loadProjects() {
  return localStorage.getItem(STORAGE_PREFIX);
}

export function saveProject(project) {
  console.log(`# Save Project:`);
  console.log(project);
  const currentSave = loadProjects();
  const currentDate = DATE.newFormatedDate('DD-MM-yyyy-hh:mm:ss');
  let newSave;

  if (currentSave) {
    newSave = JSON.parse(currentSave);
    const projectAlreadyExists = newSave.projects.find(p => p.uuid === project.uuid);
    if (projectAlreadyExists) { newSave.projects = newSave.projects.filter(p => p.uuid !== projectAlreadyExists.uuid) };
    project.last_update = currentDate;
    newSave.projects.push(project);

  } else {
    project.created_at = currentDate;
    project.last_update = currentDate;
    newSave = { created_at: currentDate, projects: [project] };
  }

  newSave.last_update = currentDate;
  localStorage.setItem(STORAGE_PREFIX, JSON.stringify(newSave));
}

export function deleteProject() {
  localStorage.removeItem(STORAGE_PREFIX);
}

export function saveInformation(information) {
  localStorage.setItem(JSON.stringify(information));
}
