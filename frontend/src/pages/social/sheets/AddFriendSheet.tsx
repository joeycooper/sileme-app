type AddFriendSheetProps = {
  open: boolean;
  phone: string;
  message: string;
  messageLimit: number;
  submitting: boolean;
  onClose: () => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

export default function AddFriendSheet({
  open,
  phone,
  message,
  messageLimit,
  submitting,
  onClose,
  onPhoneChange,
  onMessageChange,
  onSubmit
}: AddFriendSheetProps) {
  return (
    <>
      <div className={`sheet-overlay ${open ? "show" : ""}`} onClick={onClose} />
      <div className={`sheet ${open ? "show" : ""}`} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>添加好友</h3>
          <button className="link" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="sheet-section">
          <div className="social-form">
            <label>
              手机号
              <input
                type="tel"
                placeholder="输入对方手机号"
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                name="friend_phone"
                required
              />
            </label>
            <label className="span-2">
              留言
              <input
                type="text"
                placeholder="给对方说一句话"
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                name="friend_message"
                maxLength={messageLimit}
              />
              <span className="char-remaining">剩余 {messageLimit - message.length} 字</span>
            </label>
            <button
              className="primary span-2"
              type="button"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "发送中..." : "发送好友请求"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
