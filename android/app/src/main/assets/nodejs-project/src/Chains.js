const { dateSimple } = require('./Functions')
exports.projects = () => "projects"
exports.project = projectId => `projects/${projectId}`
exports.projectHistory = projectId => `history/projects/${projectId}`

exports.running = () => 'running'

exports.timers = () => "timers"
exports.timer = timerId => `timers/${timerId}`
exports.timerHistory = timerId => `history/timers/${timerId}`
exports.projectTimer = (projectId, timerId) => `project/${projectId}/timers/${timerId}`
exports.dateTimer = (date, timerId) => `date/timers/${dateSimple(date)}`
exports.projectTimers = projectId => `project/${projectId}/timers`
exports.dateTimers = () => `date/timers`

