import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/alert_model.dart';
import '../theme.dart';

class NotificationsScreen extends StatelessWidget {
  final List<AlertModel> alerts;
  final Function(String id) onResolveAlert;
  final VoidCallback onMarkAllRead;

  const NotificationsScreen({
    Key? key,
    required this.alerts,
    required this.onResolveAlert,
    required this.onMarkAllRead,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.notifications_active_outlined, color: AppTheme.warning, size: 22),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Notification Center',
                  style: TextStyle(fontFamily: 'Outfit', fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (alerts.isNotEmpty) ...[
                const SizedBox(width: 6),
                TextButton.icon(
                  onPressed: onMarkAllRead,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  icon: const Icon(Icons.done_all_rounded, color: AppTheme.success, size: 14),
                  label: const Text('Mark All Read', style: TextStyle(color: AppTheme.success, fontSize: 11)),
                ),
              ],
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
                child: Text('${alerts.length} unread', style: const TextStyle(color: AppTheme.warning, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const Divider(color: AppTheme.borderLight, height: 24),

          Expanded(
            child: alerts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.done_all_rounded, color: AppTheme.textMuted, size: 40),
                        SizedBox(height: 8),
                        Text('Your health logs are stable. No warnings.', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: alerts.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (ctx, idx) {
                      final alert = alerts[idx];
                      final critical = alert.severity == 'Critical';
                      final color = critical ? AppTheme.danger : AppTheme.warning;

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.08),
                          border: Border.all(color: color.withOpacity(0.2)),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  alert.type.toUpperCase(),
                                  style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 0.5),
                                ),
                                TextButton.icon(
                                  onPressed: () => onResolveAlert(alert.id),
                                  style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  icon: Icon(Icons.done, color: AppTheme.textSecondary, size: 12),
                                  label: Text('Dismiss', style: TextStyle(color: AppTheme.textSecondary, fontSize: 11, decoration: TextDecoration.underline)),
                                )
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              alert.message,
                              style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Logged: ${DateFormat('yyyy-MM-dd HH:mm').format(alert.timestamp)}',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
