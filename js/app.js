const taskManager = new Vue({
    el: '#app',
    data() {
        return {
            newTask: {
                title: '',
                list: ['', '', ''],
                completedAt: null,
            },
            taskColumns: [
                { taskCards: JSON.parse(localStorage.getItem('column1')) || [] },
                { taskCards: JSON.parse(localStorage.getItem('column2')) || [] },
                { taskCards: JSON.parse(localStorage.getItem('column3')) || [] },
            ],
            restrictFirstColumn: false,
        };
    },
    methods: {

    },
    components: { TaskColumn },
    template: `
        <div id="app">
            <div class="task-manager">
                <h2>Создай новую заметку</h2>
                <form @submit.prevent="addTask">
                    <label for="title">Название:</label>
                    <input v-model="newTask.title" id="title" type="text" required />
                    <label>Пункты (минимум 3, максимум 5):</label>
                    <div v-for="(item, index) in newTask.list" :key="index" class="task-item">
                        <input v-model="newTask.list[index]" type="text" required />
                        <button type="button" @click="removeTaskItem(index)" v-if="newTask.list.length > 3">−</button>
                    </div>
                    <button type="button" @click="addTaskItem" :disabled="newTask.list.length >= 5">+</button>
                    <button type="submit" :disabled="restrictFirstColumn">Создать</button>
                </form>
            </div>
            <div class="task-container">
                <TaskColumn v-for="(column, index) in taskColumns"
                            :key="index"
                            :columnID="index + 1"
                            :taskCards="column.taskCards"
                            :relocateTask="relocateTask"
                            :modifyTask="modifyTask"
                            :secondColumnTaskCount="taskColumns[1].taskCards.length" />
            </div>
        </div>
    `,
});