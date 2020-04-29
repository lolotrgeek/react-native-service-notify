import { isValid } from 'date-fns'
export const isValidEntry = entry => entry && Array.isArray(entry) && entry.length === 2 ? true : false
export const isTimer = entry => isValidEntry(entry) && entry[1].type === 'timer' ? true : false
export const isRunning = timer => isTimer(timer) && timer[1].status === 'running' ? true : false
export const colorValid = color => color && typeof color === 'string' && color.length > 0 && color.charAt(0) === '#' ? true : false
export const projectValid = project => Array.isArray(project) && project.length === 2 && project[1] && project[1].type === 'project' ? true : false
export const nameValid = name => typeof name === 'string' && name.length > 0 ? true : false
export const dateValid = date => isValid(date) ? true : false