export type NotificationType = 'new_season' | 'new_episodes' | 'status_canceled' | 'status_ended';

export type NotificationStatus = 'unread' | 'read' | 'deleted';

export interface NotificationVariables {
    season_number?: number;
    episode_count?: number;
    season_numbers?: number[];
    count?: number;
    status?: string;
}

export interface Notification {
    user_notification_id: number;
    notification_id: number;
    serie_id: number;
    serie_name: string;
    serie_poster: string;
    type: NotificationType;
    translation_key: string;
    variables: NotificationVariables;
    status: NotificationStatus;
    notified_at: string;
    read_at: string | null;
    created_at: string;
}
