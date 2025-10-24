const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');

// Configure email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Check for due tasks every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find tasks due within 24 hours that haven't been reminded
    const dueTasks = await Task.find({
      dueDate: { $lte: tomorrow, $gte: now },
      status: { $ne: 'done' },
      'reminders.scheduledFor': { $ne: tomorrow.toDateString() }
    }).populate('assignedTo');

    for (const task of dueTasks) {
      if (task.assignedTo && task.assignedTo.email) {
        // Send email reminder
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: task.assignedTo.email,
          subject: `Task Due Soon: ${task.title}`,
          html: `
            <h2>Task Reminder</h2>
            <p>Your task "<strong>${task.title}</strong>" is due soon.</p>
            <p><strong>Due Date:</strong> ${task.dueDate.toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            <p>Please complete this task as soon as possible.</p>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          
          // Mark reminder as sent
          task.reminders.push({
            type: 'email',
            sentAt: new Date(),
            scheduledFor: tomorrow
          });
          await task.save();
          
          console.log(`Reminder sent for task: ${task.title}`);
        } catch (emailError) {
          console.error('Failed to send email reminder:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder cron job:', error);
  }
});

module.exports = { transporter };