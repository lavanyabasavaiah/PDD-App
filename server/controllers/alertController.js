import Alert from '../models/Alert.js';

// Get all alerts for the user
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // optional filter by status: 'Unread', 'Read', 'Resolved'

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const alerts = await Alert.find(filter).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Get Alerts Error:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};

// Update status of a single alert (Read / Resolved)
export const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status || !['Unread', 'Read', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status } },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Update Alert Error:', error);
    res.status(500).json({ message: 'Server error updating alert' });
  }
};

// Mark all alerts as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Alert.updateMany(
      { userId, status: 'Unread' },
      { $set: { status: 'Read' } }
    );
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ message: 'Server error marking alerts as read' });
  }
};
