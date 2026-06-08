const { Reminder } = require('../models');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({ 
      where: { userId: req.user.id },
      order: [['dueDate', 'ASC']]
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { task, category, priority, dueDate } = req.body;
    const reminder = await Reminder.create({
      userId: req.user.id,
      task,
      category,
      priority,
      dueDate
    });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const { task, category, priority, dueDate, completed } = req.body;
    await reminder.update({
      task: task || reminder.task,
      category: category || reminder.category,
      priority: priority || reminder.priority,
      dueDate: dueDate || reminder.dueDate,
      completed: completed !== undefined ? completed : reminder.completed
    });

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    await reminder.destroy();
    res.json({ message: 'Reminder removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
