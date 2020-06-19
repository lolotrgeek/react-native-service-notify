import { isValid } from 'date-fns'
export const isValidEntry = entry => entry && typeof entry === 'object' ? true : false
export const isTimer = entry => isValidEntry(entry) && entry.type === 'timer' ? true : false
export const isRunning = timer => isTimer(timer) && timer.status === 'running' ? true : false
export const colorValid = color => color && typeof color === 'string' && color.length > 0 && color.charAt(0) === '#' ? true : false
export const projectValid = project => project && typeof project === 'object' && project.type === 'project' ? true : false
export const nameValid = name => typeof name === 'string' && name.length > 0 ? true : false
export const dateValid = date => isValid(date) ? true : false