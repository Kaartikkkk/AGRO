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
  ArrowRight,
  Droplet,
  Sprout,
  Wheat,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { reminderService } from '../../../services/api.service';
import { motion, AnimatePresence } from 'framer-motion';

// Category mapping helper
const getCategoryDetails = (category) => {
  switch (category) {
    case 'Irrigation':
      return { icon: Droplet, color: 'text-blue-500 bg-blue-50 border-blue-100', label: 'Irrigation' };
    case 'Fertilization':
      return { icon: Sprout, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', label: 'Fertilization' };
    case 'Harvesting':
      return { icon: Wheat, color: 'text-amber-500 bg-amber-50 border-amber-100', label: 'Harvesting' };
    case 'Pest Control':
      return { icon: ShieldAlert, color: 'text-red-500 bg-red-50 border-red-100', label: 'Pest Control' };
    default:
      return { icon: HelpCircle, color: 'text-gray-500 bg-gray-50 border-gray-100', label: 'Other' };
  }
};

const TaskPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  // Set default date to today and time to current hour + 1
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [newTask, setNewTask] = useState({ 
    task: '', 
    date: getTodayString(), 
    time: '08:00',
    category: 'Other',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await reminderService.getReminders();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time to create due date timestamp
      const dueDateTime = new Date(`${newTask.date}T${newTask.time}`);
      
      const payload = {
        task: newTask.task,
        dueDate: dueDateTime.toISOString(),
        category: newTask.category,
        priority: newTask.priority
      };

      await reminderService.createReminder(payload);
      setNewTask({ 
        task: '', 
        date: getTodayString(), 
        time: '08:00',
        category: 'Other',
        priority: 'Medium'
      });
      setShowAdd(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to add reminder:", err);
    }
  };

  const toggleComplete = async (id, currentCompleted) => {
    try {
      await reminderService.updateReminder(id, { completed: !currentCompleted });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update reminder:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete reminder:", err);
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
          className="p-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
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
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Description</label>
            <input 
              type="text" 
              placeholder="What needs to be done?"
              className="w-full bg-white border border-border rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={newTask.task}
              onChange={(e) => setNewTask({...newTask, task: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
              <select
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              >
                <option value="Other">Other</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Fertilization">Fertilization</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Pest Control">Pest Control</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</label>
              <select
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</label>
              <input 
                type="date"
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={newTask.date}
                onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Time</label>
              <input 
                type="time"
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={newTask.time}
                onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button className="btn-primary text-sm py-2 px-5 cursor-pointer">Add Task</button>
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
            tasks.map((task, i) => {
              const cat = getCategoryDetails(task.category);
              const CatIcon = cat.icon;
              const dateObj = new Date(task.dueDate);
              
              return (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${
                    task.completed 
                      ? 'bg-surface-alt border-border-light opacity-60' 
                      : 'bg-white border-border hover:border-primary-100 hover:bg-primary-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleComplete(task.id, task.completed)}
                      className={`transition-colors cursor-pointer ${
                        task.completed ? 'text-primary' : 'text-gray-300 hover:text-primary'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold leading-tight ${
                          task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}>
                          {task.task}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${cat.color}`}>
                          <CatIcon size={10} />
                          {cat.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                          <Calendar size={11} /> 
                          {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                          <Clock size={11} /> 
                          {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        
                        {task.priority !== 'Medium' && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.25 rounded-md ${
                            task.priority === 'Critical' || task.priority === 'High'
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-500 bg-gray-150'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-danger-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-4 border-t border-border-light">
        <button className="w-full flex items-center justify-between p-3.5 bg-surface-alt rounded-xl border border-border-light hover:border-border hover:bg-surface-hover transition-colors group cursor-pointer">
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
