const TaskCard = {
    props: {
        taskTitle: String,
        taskItems: Array,
        taskColumn: Number,
        taskIndex: Number,
        completionTime: String,
        relocateTask: Function,
        modifyTask: Function,
        secondColumnTaskCount: Number,
        restrictFirstColumn: Boolean,
    },
    template: `
        <div class="task-card">
            <h3>{{ taskTitle }}</h3>
            <ul>
                <li v-for="(item, index) in taskItems" :key="index">{{ item }}</li>
            </ul>
            <button @click="moveTask">Переместить</button>
            <button @click="editTask">Редактировать</button>
        </div>
    `,
    methods: {
        moveTask() {
            this.relocateTask({ column: this.taskColumn, index: this.taskIndex }, this.taskColumn + 1);
        },
        editTask() {
            const newData = { title: "Новое название", list: ["Новый пункт"] }; // Пример данных
            this.modifyTask(this.taskIndex, this.taskColumn, newData);
        },
    },
};

const TaskColumn = {
    props: {
        columnID: Number,
        taskCards: Array,
        relocateTask: Function,
        modifyTask: Function,
        secondColumnTaskCount: Number,
        restrictFirstColumn: Boolean,
    },
    components: { TaskCard },
    template: `
        <div class="task-column">
            <h2>Столбец {{ columnID }}</h2>
            <div v-for="(card, index) in taskCards" :key="index">
                <TaskCard
                  :taskTitle="card.title"
                  :taskItems="card.list"
                  :taskColumn="columnID"
                  :taskIndex="index"
                  :completionTime="card.completedAt"
                  :relocateTask="relocateTask"
                  :modifyTask="modifyTask"
                  :secondColumnTaskCount="secondColumnTaskCount"
                  :restrictFirstColumn="restrictFirstColumn"
                />
            </div>
        </div>
    `,
};

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
        addTask() {
            if (this.newTask.title && this.newTask.list.every(item => item.trim() !== '')) {
                this.taskColumns[0].taskCards.push({ ...this.newTask });
                this.newTask = { title: '', list: ['', '', ''], completedAt: null };
                this.saveToLocalStorage();
                this.evaluateColumnRestrictions();
            }
        },
        addTaskItem() {
            if (this.newTask.list.length < 5) {
                this.newTask.list.push('');
            }
        },
        removeTaskItem(index) {
            if (this.newTask.list.length > 3) {
                this.newTask.list.splice(index, 1);
            }
        },
        relocateTask(taskIndex, columnIndex) {
            if (taskIndex.column === 1 && this.restrictFirstColumn) return;
            const task = this.taskColumns[taskIndex.column - 1].taskCards.splice(taskIndex.index, 1)[0];
            this.taskColumns[columnIndex - 1].taskCards.push(task);
            this.saveToLocalStorage();
            this.evaluateColumnRestrictions();
        },
        modifyTask(index, column, data) {
            Object.assign(this.taskColumns[column - 1].taskCards[index], data);
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            this.taskColumns.forEach((column, index) => {
                localStorage.setItem(`column${index + 1}`, JSON.stringify(column.taskCards));
            });
        },
        evaluateColumnRestrictions() {
            this.restrictFirstColumn = this.taskColumns[1].taskCards.length > 5;
        },
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
                            :secondColumnTaskCount="taskColumns[1].taskCards.length"
                            :restrictFirstColumn="restrictFirstColumn" />
            </div>
        </div>
    `,
});