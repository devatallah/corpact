import { ConfirmModal } from 'teamat-ui';

export const DeleteBooking = () => (
    // The capture harness puts transform:translateZ(0) on the story root, so this
    // non-portaled fixed overlay positions against it; give it a full-viewport stage.
    <div dir="rtl" style={{ height: '100vh' }}>
        <ConfirmModal
            open
            title="تأكيد حذف الحجز؟"
            message="هل أنت متأكد من حذف حجز نشاط «بولينج الفريق»؟ لا يمكن التراجع عن هذا الإجراء."
            confirmLabel="حذف"
            onConfirm={() => {}}
            onCancel={() => {}}
        />
    </div>
);
