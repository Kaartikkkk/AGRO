import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle,
  Trash2,
  ListTodo,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { reminderService } from '../../../services/api.service';
import { motion, AnimatePresence } from 'framer-motion';

const TaskPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', scheduledFor: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await reminderService.getReminders();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await reminderService.createReminder(newTask);
      setNewTask({ title: '', scheduledFor: '' });
      setShowAdd(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to add reminder");
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await reminderService.updateReminder(id, { status: currentStatus === 'completed' ? 'pending' : 'completed' });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update reminder");
    }
  };

  const deleteTask = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete reminder");
    }
  };

  return (
    <div className="card-padded flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-50 text-primary rounded-xl">
            <ListTodo size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Tasks & Reminders</h3>
            <p className="text-xs text-gray-400">Manage your farm schedule</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <motion.form 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          onSubmit={handleAddTask} 
          className="mb-5 p-4 bg-surface-alt rounded-xl border border-border-light space-y-3"
        >
          <input 
            type="text" 
            placeholder="What needs to be done?"
            className="w-full bg-white border border-border rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            required
          />
          <div className="flex gap-3">
            <input 
              type="date"
              className="flex-1 bg-white border border-border rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={newTask.scheduledFor}
              onChange={(e) => setNewTask({...newTask, scheduledFor: e.target.value})}
              required
            />
            <button className="btn-primary text-sm py-2.5 px-5">Add</button>
          </div>
        </motion.form>
      )}

      {/* Task List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {tasks.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-gray-300">
              <Sparkles size={40} className="opacity-30 mb-3" />
              <p className="text-sm font-medium">No active tasks</p>
              <p className="text-xs text-gray-400 mt-1">Everything is under control</p>
            </div>
          ) : (
            tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03 }}
                className={`p-3.5 rounded-xl border flex items-center justify-between group transition-colors ${
                  task.status === 'completed' 
                    ? 'bg-surface-alt border-border-light opacity-60' 
                    : 'bg-white border-border hover:border-primary-100 hover:bg-primary-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleComplete(task.id, task.status)}
                    className={`transition-colors ${
                      task.status === 'completed' ? 'text-primary' : 'text-gray-300 hover:text-primary'
                    }`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div>
                    <h4 className={`text-sm font-semibold leading-tight ${
                      task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} /> {new Date(task.scheduledFor).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} /> Morning
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-danger-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-4 border-t border-border-light">
        <button className="w-full flex items-center justify-between p-3.5 bg-surface-alt rounded-xl border border-border-light hover:border-border hover:bg-surface-hover transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-accent text-white rounded-lg">
              <Sparkles size={14} />
            </div>
            <span className="text-xs font-semibold text-gray-700">View All Tasks</span>
          </div>
          <ArrowRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default TaskPanel;
