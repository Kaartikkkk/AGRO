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
import { reminderService } from '../../services/api';
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
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full relative group overflow-hidden">
      {/* Decorative SVG Graphic */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
        <svg viewBox="0 0 100 100" fill="currentColor">
           <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" fill="none" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-fresh-green/10 text-fresh-green rounded-3xl border border-fresh-green/20">
            <ListTodo size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Smart Tasks</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">AI-Optimized Schedule</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="p-3 bg-deep-green text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-green-100 group-hover:scale-110 active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      {showAdd && (
        <motion.form 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          onSubmit={handleAddTask} 
          className="mb-8 p-6 bg-gray-50 rounded-[32px] border border-gray-100 relative z-10 space-y-4"
        >
          <input 
            type="text" 
            placeholder="What needs to be done?"
            className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-fresh-green outline-none shadow-sm"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            required
          />
          <div className="flex gap-4">
            <input 
              type="date"
              className="flex-1 bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-fresh-green outline-none shadow-sm"
              value={newTask.scheduledFor}
              onChange={(e) => setNewTask({...newTask, scheduledFor: e.target.value})}
              required
            />
            <button className="px-6 py-4 bg-deep-green text-wheat-yellow rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">Add</button>
          </div>
        </motion.form>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        <AnimatePresence>
          {tasks.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-300">
               <div className="p-10 bg-gray-50 rounded-full mb-6">
                 <Sparkles size={64} className="opacity-20" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest mb-2">No Active Tasks</p>
               <p className="text-[10px] uppercase tracking-widest text-gray-400">Everything is under control</p>
            </div>
          ) : (
            tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-[28px] border flex items-center justify-between group/task transition-all hover:bg-gray-50/50 ${
                  task.status === 'completed' ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-50 shadow-sm hover:border-sky-100 shadow-gray-100/50'
                }`}
              >
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => toggleComplete(task.id, task.status)}
                    className={`transition-all duration-300 ${
                      task.status === 'completed' ? 'text-deep-green' : 'text-gray-200 hover:text-deep-green'
                    }`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  <div>
                    <h4 className={`text-lg font-black leading-tight ${
                      task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                         <Calendar size={12} /> {new Date(task.scheduledFor).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                       </div>
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                         <Clock size={12} /> Early Morning
                       </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-3 bg-red-50 text-red-100 group-hover/task:text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all scale-75 group-hover/task:scale-100 opacity-0 group-hover/task:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 relative z-10">
        <button className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100 hover:scale-[1.02] active:scale-95 transition-all group/btn shadow-sm">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-wheat-yellow text-white rounded-xl shadow-lg shadow-wheat-yellow/20">
                <Sparkles size={18} />
             </div>
             <span className="text-xs font-black text-gray-800 uppercase tracking-widest">View All Historical Data</span>
          </div>
          <ArrowRight size={20} className="text-gray-300 group-hover/btn:text-deep-green group-hover/btn:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default TaskPanel;
