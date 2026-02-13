type NotificationRouteInput = {
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  relatedId?: string;
  relatedModel?: string;
};

const getMetadataValue = (
  metadata: Record<string, unknown> | undefined,
  key: string
) => {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

export const resolveAdminNotificationRoute = (
  notification: NotificationRouteInput
): string | undefined => {
  const actionUrl = notification.actionUrl?.trim();
  const conversationId =
    getMetadataValue(notification.metadata, "conversationId") ||
    (notification.relatedModel === "Conversation"
      ? notification.relatedId
      : undefined);
  const enquiryId =
    getMetadataValue(notification.metadata, "enquiryId") ||
    (notification.relatedModel === "Enquiry" ? notification.relatedId : undefined);

  if (actionUrl) {
    const chatMatch = actionUrl.match(/^\/chat\/([^/?#]+)/i);
    if (chatMatch) {
      return `/messages?conversationId=${encodeURIComponent(chatMatch[1]!)}`;
    }

    if (/^\/chat\/?$/i.test(actionUrl)) {
      return conversationId
        ? `/messages?conversationId=${encodeURIComponent(conversationId)}`
        : "/messages";
    }

    if (actionUrl.startsWith("/messages") && conversationId) {
      const [path, query = ""] = actionUrl.split("?");
      const params = new URLSearchParams(query);
      if (!params.get("conversationId")) {
        params.set("conversationId", conversationId);
      }
      const qs = params.toString();
      return qs ? `${path}?${qs}` : path;
    }

    return actionUrl;
  }

  if (conversationId) {
    return `/messages?conversationId=${encodeURIComponent(conversationId)}`;
  }

  if (enquiryId) {
    return `/enquiries/${encodeURIComponent(enquiryId)}`;
  }

  return undefined;
};
