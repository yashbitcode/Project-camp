const userRoles = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member",
};

const taskStatus = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
};

const availableUserRoles = Object.values(userRoles);
const availableTaskStatus = Object.values(taskStatus);