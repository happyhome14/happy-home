import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ===============================
// KẾT NỐI SUPABASE
// ===============================

const SUPABASE_URL = "https://idcsmnlhjnupvrpenlxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ===============================
// XỬ LÝ ĐẶT PHÒNG
// ===============================

async function submitBooking() {

    // LẤY THÔNG TIN KHÁCH

    const customerName =
        document.getElementById("customerName").value.trim();

    const customerPhone =
        document.getElementById("customerPhone").value.trim();

    const customerEmail =
        document.getElementById("customerEmail").value.trim();

    const roomType =
        document.getElementById("roomType").value;

    const guestNumber =
        document.getElementById("guestNumber").value;

    const checkIn =
        document.getElementById("checkIn").value;

    const checkOut =
        document.getElementById("checkOut").value;

    const note =
        document.getElementById("note").value.trim();


    // ===============================
    // KIỂM TRA THÔNG TIN
    // ===============================

    if (
        customerName === "" ||
        customerPhone === "" ||
        roomType === "" ||
        checkIn === "" ||
        checkOut === ""
    ) {

        alert("Vui lòng nhập đầy đủ các thông tin bắt buộc!");

        return;
    }


    // ===============================
    // KIỂM TRA NGÀY
    // ===============================

    if (checkOut <= checkIn) {

        alert("Ngày trả phòng phải sau ngày nhận phòng!");

        return;
    }


    // ===============================
    // TẠO MÃ ĐƠN
    // ===============================

    const bookingId =
        "HH" + Date.now();


    // ===============================
    // GỬI ĐƠN LÊN SUPABASE
    // ===============================

    const { error } = await supabase
        .from("bookings")
        .insert({

            id: bookingId,

            customer_name: customerName,

            customer_phone: customerPhone,

            customer_email: customerEmail,

            room_type: roomType,

            guest_number: Number(guestNumber),

            check_in: checkIn,

            check_out: checkOut,

            note: note,

            status: "Chờ xác nhận"

        });


    // ===============================
    // NẾU CÓ LỖI
    // ===============================

    if (error) {

        console.error("Lỗi đặt phòng:", error);

        alert(
            "Không thể gửi đơn đặt phòng.\n\n" +
            "Vui lòng thử lại!"
        );

        return;
    }


    // ===============================
    // THÀNH CÔNG
    // ===============================

    alert(
        "Đặt phòng thành công!\n\n" +
        "Mã đặt phòng: " + bookingId +
        "\n\n" +
        "Happy Home sẽ kiểm tra và xác nhận đơn của bạn."
    );


    // ===============================
    // XÓA FORM
    // ===============================

    document.getElementById("customerName").value = "";

    document.getElementById("customerPhone").value = "";

    document.getElementById("customerEmail").value = "";

    document.getElementById("roomType").value = "";

    document.getElementById("guestNumber").value = "2";

    document.getElementById("checkIn").value = "";

    document.getElementById("checkOut").value = "";

    document.getElementById("note").value = "";
}


// ===============================
// CHO HTML SỬ DỤNG HÀM
// ===============================

window.submitBooking = submitBooking;

// ===============================
// CHUYỂN SANG TRANG ĐẶT PHÒNG
// ===============================

function selectRoom(roomName) {
    window.location.href =
        "booking.html?room=" + encodeURIComponent(roomName);
}

// Cho HTML sử dụng hàm
window.selectRoom = selectRoom;

