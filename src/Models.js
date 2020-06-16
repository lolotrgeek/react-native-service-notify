import Hashids from 'hashids'

export const cloneTimer = timer => {
    const hashids = new Hashids()
    let clone = timer
    timer.id = hashids.encode(Date.now().toString())
    return clone
}

export const newTimer = projectId => {
    const hashids = new Hashids()
    const key = hashids.encode(Date.now().toString())
    const start = new Date().toString()
    const timer = {
        id: key,
        created: start,
        started: start,
        ended: '',
        type: 'timer',
        project: projectId,
        status: 'running',
        edited: '',
        total: 0,
        mood: 'good',
        energy: 50,
    }
    return timer
}

export const doneTimer = (timer) => {
    const done = timer
    done.ended = new Date().toString()
    done.status = 'done'
    return done
}

export const testProject = () => {
    return {
        id: 'testproject',
        created: new Date().toString(),
        type: 'project',
        status: 'active',
        name: 'test project',
        color: '#ccc',        
    }
}

export const newProject = (name, color) => {
    const hashids = new Hashids()
    const key = hashids.encode(Date.now().toString())
    const project = {
        id: key,
        created: new Date().toString(),
        type: 'project',
        status: 'active',
        name: name,
        color: color,
        // time: typeof time === 'string' && time.length > 0 ? parseInt(time) : time
    }
    return project
}

export const editedProject = (project, updates) => {
    let update = project
    update = Object.assign(project, updates)
    update.edited = new Date().toString()
    return update
}