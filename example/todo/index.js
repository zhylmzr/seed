function toggleClass(e, cls) {
    let clsName = ["all", "remaining", "completed"]
    clsName.forEach(n => {
        if (n !== cls) {
            e.classList.remove(n)
        }
    })
    e.classList.add(cls)
}

let todos = [{
    title: 'hello',
    done: true,
    hide: false,
}, {
    title: 'WoW',
    done: false,
    hide: false,
}, {
    title: 'test',
    done: false,
    hide: false,
}]

let app = new Seed('#app', {
    data: {
        todos,
        remaining: todos.reduce((count, todo) => {
            return count + (todo.done ? 0 : 1)
        }, 0)
    },
    methods: {
        addTodo(e) {
            let title = e.el.value
            if (title) {
                e.el.value = ''
                this.scope.todos.push({ title, done: false })
                this.scope.remaining++
            }
        },
        filter(e) {
            let cls = e.el.className.replace('selected', '').trim()
            toggleClass(this.root, cls)
        },
        markAll() {
            let mark = this.scope.todos.reduce((flag, e) => {
                return flag && e.done
            }, true)
            this.scope.todos.forEach(todo => {
                todo.done = !mark
            })
        },
        clearCompleted() {
            let todos = this.scope.todos
            let length = todos.length
            let removed = []
            for (let i = 0; i < length; i++) {
                if (todos[i].done) {
                    removed.push(i)
                }
            }

            let count = 0
            removed.forEach(index => {
                todos.splice(index - count, 1)
                count++
            })
        },
        removeTodo(e) {
            let i = e.seed.options.eachIndex
            let scope = this.options.parent.scope
            scope.todos.splice(i, 1)
            scope.remaining -= e.seed.scope.done ? 0 : 1
        },
        toggleTodo(e) {
            let scope = this.options.parent.scope
            scope.remaining += e.seed.scope.done ? -1 : 1
        },
        editTodo(e) {
            e.seed.scope.hide = true
            let input = e.seed.root.querySelector('input.edit')
            input.focus()
        },
        saveTodo(e) {
            e.seed.scope.title = e.el.value
            e.seed.scope.hide = false
        }
    }
})