import { dateSimple } from '../constants/Functions'
export const projects = () => "projects"
export const project = projectId => `projects/${projectId}`
export const projectHistory = projectId => `history/projects/${projectId}`

export const running = () => 'running'

export const timers = () => "timers"
export const timer = timerId => `timers/${timerId}`
export const timerHistory = timerId => `history/timers/${timerId}`
export const projectTimer = (projectId, timerId) => `project/${projectId}/timers/${timerId}`
export const dateTimer = (date, timerId) => `date/timers/${dateSimple(date)}`
export const projectTimers = projectId => `project/${projectId}/timers`
export const dateTimers = () => `date/timers`

