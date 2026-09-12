// ==========================================
// CẤU HÌNH SUPABASE
// ==========================================

const SUPABASE_URL = "https://idcsmnlhjnupvrpenlxx.supabase.co";

// DÁN ĐÚNG PUBLISHABLE KEY DƯƠNG ĐANG DÙNG
const SUPABASE_KEY = "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// DANH SÁCH PHÒNG THỰC TẾ
// ==========================================

const roomList = [
    {
        room_number: "101",
        room_type: "Phòng nhóm",
        capacity: 6
    },
    {
        room_number: "Bình Minh",
        room_type: "Phòng lớn",
        capacity: 4
    },
    {
        room_number: "Hoàng Hôn",
        room_type: "Phòng lớn",
        capacity: 4
    },
    {
        room_number: "Tự Do",
        room_type: "Phòng nhỏ",
        capacity: 3
    },
    {
        room_number: "An Nhiên",
        room_type: "Phòng nhỏ",
        capacity: 3
    }
];


// ==========================================
// GIÁ PHÒNG
// ==========================================

const roomPrices = {
    "Phòng nhỏ": {
        weekday: 450000,
        weekend: 700000
    },

    "Phòng lớn": {
        weekday: 800000,
        weekend: 1000000
    },

    "Phòng nhóm": {
        weekday: 800000,
        weekend: 850000
    },

    "4PN": {
        weekday: 2500000,
        weekend: 4000000
    },

    "Nguyên căn": {
        weekday: 3000000,
        weekend: 4500000
    }
};


// ==========================================
// SỨC CHỨA
// ==========================================

const roomCapacities = {
    "Phòng nhỏ": 3,
    "Phòng lớn": 4,
    "Phòng nhóm": 6,
    "4PN": 16,
    "Nguyên căn": 20
};


// ==========================================
// PHÒNG THUỘC 4PN
// ==========================================

const fourRooms = [
    "Bình Minh",
    "Hoàng Hôn",
    "Tự Do",
    "An Nhiên"
];


// ==========================================
// KHI CHỌN LOẠI PHÒNG
// HIỂN THỊ PHÒNG CỤ THỂ
// ==========================================

async function updateRoomList() {

    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");

    if (!roomType || !roomNumber) return;

    const selectedType = roomType.value;

    roomNumber.innerHTML = `
        <option value="">-- Chọn phòng --</option>
    `;

    // -------------------------------
    // 4PN
    // -------------------------------

    if (selectedType === "4PN") {

        roomNumber.innerHTML += `
            <option value="4PN">
                4PN - Bình Minh + Hoàng Hôn + Tự Do + An Nhiên
            </option>
        `;

        return;
    }


    // -------------------------------
    // NGUYÊN CĂN
    // -------------------------------

    if (selectedType === "Nguyên căn") {

        roomNumber.innerHTML += `
            <option value="Nguyên căn">
                Nguyên căn - toàn bộ 5 phòng
            </option>
        `;

        return;
    }


    // -------------------------------
    // PHÒNG THƯỜNG
    // -------------------------------

    if (!selectedType) return;

    const rooms = roomList.filter(
        room => room.room_type === selectedType
    );

    rooms.forEach(room => {

        roomNumber.innerHTML += `
            <option value="${room.room_number}">
                ${room.room_number} - tối đa ${room.capacity} khách
            </option>
        `;
    });
}


// ==========================================
// KIỂM TRA CUỐI TUẦN
// THỨ 6, THỨ 7, CHỦ NHẬT = CUỐI TUẦN
// ==========================================

function isWeekend(date) {

    const day = date.getDay();

    return day === 5 || day === 6 || day === 0;
}


// ==========================================
// ĐỊNH DẠNG TIỀN
// ==========================================

function formatMoney(number) {

    return new Intl.NumberFormat("vi-VN").format(number) + "đ";
}


// ==========================================
// KIỂM TRA SỐ KHÁCH
// ==========================================

function checkGuestCapacity() {

    const roomType = document.getElementById("roomType").value;
    const guestNumber = Number(
        document.getElementById("guestNumber").value
    );

    if (!roomType || !guestNumber) {
        return true;
    }

    const capacity = roomCapacities[roomType];

    if (guestNumber > capacity) {

        alert(
            `Loại phòng này chỉ chứa tối đa ${capacity} khách.`
        );

        return false;
    }

    return true;
}


// ==========================================
// LẤY THỜI GIAN NHẬN PHÒNG
// ==========================================

function getCheckInDateTime() {

    const date = document.getElementById("checkInDate").value;
    const time = document.getElementById("checkInTime").value;

    if (!date || !time) {
        return null;
    }

    // Việt Nam UTC+7
    return new Date(`${date}T${time}:00+07:00`);
}


// ==========================================
// TÍNH THỜI GIAN TRẢ PHÒNG
// ==========================================

function getCheckOutDateTime() {

    const checkIn = getCheckInDateTime();

    const nights = Number(
        document.getElementById("numberOfNights").value
    );

    if (!checkIn || !nights || nights < 1) {
        return null;
    }

    const checkOut = new Date(checkIn.getTime());

    checkOut.setTime(
        checkOut.getTime() +
        nights * 24 * 60 * 60 * 1000
    );

    return checkOut;
}


// ==========================================
// HIỂN THỊ THỜI GIAN TRẢ PHÒNG
// ==========================================

function updateCheckOut() {

    const display = document.getElementById(
        "checkOutDisplay"
    );

    if (!display) return;

    const checkIn = getCheckInDateTime();
    const checkOut = getCheckOutDateTime();

    if (!checkIn || !checkOut) {

        display.textContent =
            "Vui lòng chọn ngày, giờ nhận phòng và số đêm";

        return;
    }

    display.innerHTML = `
        🏠 Nhận phòng:
        <strong>${formatDateTime(checkIn)}</strong>
        <br><br>
        🚪 Trả phòng:
        <strong>${formatDateTime(checkOut)}</strong>
    `;
}


// ==========================================
// ĐỊNH DẠNG NGÀY + GIỜ
// ==========================================

function formatDateTime(date) {

    return date.toLocaleString(
        "vi-VN",
        {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ==========================================
// TÍNH GIÁ THEO TỪNG ĐÊM
// ==========================================

function calculateTotalPrice() {

    const roomType =
        document.getElementById("roomType").value;

    const checkIn =
        getCheckInDateTime();

    const nights =
        Number(
            document.getElementById("numberOfNights").value
        );

    if (!roomType || !checkIn || !nights) {
        return 0;
    }

    let total = 0;

    for (let i = 0; i < nights; i++) {

        const currentNight =
            new Date(checkIn.getTime());

        currentNight.setTime(
            currentNight.getTime() +
            i * 24 * 60 * 60 * 1000
        );

        if (isWeekend(currentNight)) {

            total += roomPrices[roomType].weekend;

        } else {

            total += roomPrices[roomType].weekday;
        }
    }

    return total;
}


// ==========================================
// HIỂN THỊ GIÁ
// ==========================================

function updateRoomPrice() {

    const roomPrice =
        document.getElementById("roomPrice");

    if (!roomPrice) return;

    const roomType =
        document.getElementById("roomType").value;

    const checkIn =
        getCheckInDateTime();

    const nights =
        Number(
            document.getElementById("numberOfNights").value
        );

    if (!roomType || !checkIn || !nights) {

        roomPrice.innerHTML =
            "💰 Vui lòng chọn loại phòng, ngày nhận và số đêm";

        return;
    }

    const total =
        calculateTotalPrice();

    roomPrice.innerHTML = `
        💰 Giá dự kiến:
        <strong>${formatMoney(total)}</strong>
        <br>
        🌙 Số đêm:
        <strong>${nights}</strong>
    `;
}


// ==========================================
// XÁC ĐỊNH CÁC PHÒNG BỊ CHIẾM
// ==========================================

function getBookedRoomNumbers(booking) {

    const type = booking.room_type;
    const number = booking.room_number;

    // -------------------------------
    // NGUYÊN CĂN
    // -------------------------------

    if (type === "Nguyên căn") {

        return roomList.map(
            room => room.room_number
        );
    }


    // -------------------------------
    // 4PN
    // -------------------------------

    if (type === "4PN") {

        return fourRooms;
    }


    // -------------------------------
    // PHÒNG THƯỜNG
    // -------------------------------

    if (number) {

        return [number];
    }

    return [];
}


// ==========================================
// KIỂM TRA HAI ĐƠN CÓ TRÙNG THỜI GIAN
// ==========================================

function isTimeConflict(
    newCheckIn,
    newCheckOut,
    oldCheckIn,
    oldCheckOut
) {

    // Cho homestay 2 giờ chuẩn bị phòng
    const preparationTime =
        2 * 60 * 60 * 1000;

    const oldBlockingEnd =
        new Date(
            oldCheckOut.getTime() +
            preparationTime
        );

    return (
        newCheckIn < oldBlockingEnd &&
        newCheckOut > oldCheckIn
    );
}


// ==========================================
// KIỂM TRA PHÒNG CÓ BỊ TRÙNG KHÔNG
// ==========================================

async function checkRoomAvailability(
    roomType,
    roomNumber,
    newCheckIn,
    newCheckOut
) {

    const { data, error } =
        await supabaseClient
            .from("bookings")
            .select(`
                id,
                room_type,
                room_number,
                check_in,
                check_out,
                status
            `);

    if (error) {

        console.error(
            "Lỗi kiểm tra phòng:",
            error
        );

        alert(
            "Không thể kiểm tra tình trạng phòng!\n\n" +
            error.message
        );

        return false;
    }


    // Những đơn này vẫn chiếm phòng
    const activeBookings =
        data.filter(
            booking =>
                booking.status !== "Đã hủy"
        );


    // Phòng mà khách mới muốn sử dụng

    let newRooms = [];

    if (roomType === "Nguyên căn") {

        newRooms =
            roomList.map(
                room => room.room_number
            );

    } else if (roomType === "4PN") {

        newRooms = fourRooms;

    } else {

        newRooms = [roomNumber];
    }


    // Kiểm tra từng đơn cũ

    for (const booking of activeBookings) {

        const oldCheckIn =
            new Date(booking.check_in);

        const oldCheckOut =
            new Date(booking.check_out);

        const oldRooms =
            getBookedRoomNumbers(booking);


        // Có ít nhất 1 phòng trùng

        const sameRoom =
            newRooms.some(
                room =>
                    oldRooms.includes(room)
            );

        if (!sameRoom) {
            continue;
        }


        // Có trùng thời gian không?

        if (
            isTimeConflict(
                newCheckIn,
                newCheckOut,
                oldCheckIn,
                oldCheckOut
            )
        ) {

            return {
                available: false,
                booking: booking
            };
        }
    }


    return {
        available: true
    };
}


// ==========================================
// TẠO MÃ ĐƠN
// ==========================================

function generateBookingCode() {

    const now = new Date();

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return (
        "HH" +
        now.getFullYear() +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        String(
            now.getDate()
        ).padStart(2, "0") +
        random
    );
}


// ==========================================
// GỬI ĐƠN ĐẶT PHÒNG
// ==========================================

async function submitBooking() {

    const customerName =
        document.getElementById(
            "customerName"
        ).value.trim();

    const customerPhone =
        document.getElementById(
            "customerPhone"
        ).value.trim();

    const customerEmail =
        document.getElementById(
            "customerEmail"
        ).value.trim();

    const roomType =
        document.getElementById(
            "roomType"
        ).value;

    const roomNumber =
        document.getElementById(
            "roomNumber"
        ).value;

    const guestNumber =
        Number(
            document.getElementById(
                "guestNumber"
            ).value
        );

    const note =
        document.getElementById(
            "note"
        ).value.trim();


    // ======================================
    // KIỂM TRA THÔNG TIN
    // ======================================

    if (!customerName) {

        alert("Vui lòng nhập họ và tên.");

        return;
    }

    if (!customerPhone) {

        alert("Vui lòng nhập số điện thoại.");

        return;
    }

    if (!roomType) {

        alert("Vui lòng chọn loại phòng.");

        return;
    }

    if (!roomNumber) {

        alert("Vui lòng chọn phòng cụ thể.");

        return;
    }

    if (!guestNumber || guestNumber < 1) {

        alert("Vui lòng nhập số lượng khách.");

        return;
    }


    // ======================================
    // KIỂM TRA SỨC CHỨA
    // ======================================

    if (!checkGuestCapacity()) {
        return;
    }


    // ======================================
    // LẤY THỜI GIAN
    // ======================================

    const checkIn =
        getCheckInDateTime();

    const checkOut =
        getCheckOutDateTime();


    if (!checkIn) {

        alert(
            "Vui lòng chọn ngày và giờ nhận phòng."
        );

        return;
    }

    if (!checkOut) {

        alert(
            "Vui lòng chọn số đêm."
        );

        return;
    }


    // Không cho đặt thời gian trong quá khứ

    if (checkIn <= new Date()) {

        alert(
            "Thời gian nhận phòng phải ở tương lai."
        );

        return;
    }


    // ======================================
    // KIỂM TRA PHÒNG
    // ======================================

    const availability =
        await checkRoomAvailability(
            roomType,
            roomNumber,
            checkIn,
            checkOut
        );


    if (!availability.available) {

        const oldBooking =
            availability.booking;

        const oldCheckOut =
            new Date(
                oldBooking.check_out
            );

        const earliestNext =
            new Date(
                oldCheckOut.getTime() +
                2 * 60 * 60 * 1000
            );


        alert(
            "❌ Phòng này đang được sử dụng hoặc chưa đủ thời gian chuẩn bị.\n\n" +
            "Khách trước trả phòng: " +
            formatDateTime(oldCheckOut) +
            "\n\n" +
            "Khách tiếp theo có thể nhận từ: " +
            formatDateTime(earliestNext)
        );

        return;
    }


    // ======================================
    // TÍNH TIỀN
    // ======================================

    const totalPrice =
        calculateTotalPrice();


    // ======================================
    // TẠO MÃ ĐƠN
    // ======================================

    const bookingCode =
        generateBookingCode();


    // ======================================
    // LƯU VÀO SUPABASE
    // ======================================

    const { data, error } =
        await supabaseClient
            .from("bookings")
            .insert([
                {
                    booking_code:
                        bookingCode,

                    customer_name:
                        customerName,

                    customer_phone:
                        customerPhone,

                    customer_email:
                        customerEmail,

                    room_type:
                        roomType,

                    room_number:
                        roomNumber,

                    guest_number:
                        guestNumber,

                    check_in:
                        checkIn.toISOString(),

                    check_out:
                        checkOut.toISOString(),

                    note:
                        note,

                    total_price:
                        totalPrice,

                    status:
                        "Chờ xác nhận"
                }
            ])
            .select();


    // ======================================
    // XỬ LÝ LỖI
    // ======================================

    if (error) {

        console.error(
            "Lỗi đặt phòng:",
            error
        );

        alert(
            "Không thể gửi đơn đặt phòng!\n\n" +
            error.message
        );

        return;
    }


    // ======================================
// HIỂN THỊ XÁC NHẬN ĐẶT PHÒNG
// ======================================

document.getElementById(
    "successBookingCode"
).textContent = bookingCode;

document.getElementById(
    "successCustomerName"
).textContent = customerName;

document.getElementById(
    "successCustomerPhone"
).textContent = customerPhone;

document.getElementById(
    "successRoom"
).textContent =
    roomType + " - " + roomNumber;

document.getElementById(
    "successGuestNumber"
).textContent =
    guestNumber + " khách";

document.getElementById(
    "successCheckIn"
).textContent =
    formatDateTime(checkIn);

document.getElementById(
    "successCheckOut"
).textContent =
    formatDateTime(checkOut);

document.getElementById(
    "successTotalPrice"
).textContent =
    formatMoney(totalPrice);


// Hiện khu vực xác nhận

document.getElementById(
    "bookingSuccess"
).style.display = "block";


// Ẩn form đặt phòng

const bookingForm =
    document.querySelector(".booking-form");

if (bookingForm) {
    bookingForm.style.display = "none";
}


// Cuộn tới phần xác nhận

document.getElementById(
    "bookingSuccess"
).scrollIntoView({
    behavior: "smooth",
    block: "start"
});

    
}
async function updateRoomAvailability() {
    const roomType = document.getElementById("roomType");
    const roomNumber = document.getElementById("roomNumber");

    if (!roomType || !roomNumber) return;

    const selectedType = roomType.value;
    const checkIn = getCheckInDateTime();
    const checkOut = getCheckOutDateTime();

    // Chưa chọn đủ thời gian
    if (!selectedType || !checkIn || !checkOut) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("bookings")
        .select(`
            id,
            room_type,
            room_number,
            check_in,
            check_out,
            status
        `);

    if (error) {
        console.error("Lỗi kiểm tra tình trạng phòng:", error);
        return;
    }

    const activeBookings = data.filter(
        booking => booking.status !== "Đã hủy"
    );

    // Danh sách phòng đang bị chiếm
    const blockedRooms = new Set();

    activeBookings.forEach(booking => {
        const oldCheckIn = new Date(booking.check_in);
        const oldCheckOut = new Date(booking.check_out);

        if (
            isTimeConflict(
                checkIn,
                checkOut,
                oldCheckIn,
                oldCheckOut
            )
        ) {
            const bookedRooms = getBookedRoomNumbers(booking);

            bookedRooms.forEach(room => {
                blockedRooms.add(room);
            });
        }
    });

    // Trường hợp 4PN
    if (selectedType === "4PN") {
        const option = roomNumber.querySelector('option[value="4PN"]');

        if (option) {
            const hasBlockedRoom = fourRooms.some(
                room => blockedRooms.has(room)
            );

            option.disabled = hasBlockedRoom;

            option.textContent = hasBlockedRoom
                ? "4PN - 🔴 Đang được sử dụng"
                : "4PN - 🟢 Có thể đặt";
        }

        return;
    }

    // Trường hợp nguyên căn
    if (selectedType === "Nguyên căn") {
        const option = roomNumber.querySelector(
            'option[value="Nguyên căn"]'
        );

        if (option) {
            const hasBlockedRoom = roomList.some(
                room => blockedRooms.has(room.room_number)
            );

            option.disabled = hasBlockedRoom;

            option.textContent = hasBlockedRoom
                ? "Nguyên căn - 🔴 Đang được sử dụng"
                : "Nguyên căn - 🟢 Có thể đặt";
        }

        return;
    }

    // Các phòng riêng lẻ
    const options = roomNumber.querySelectorAll("option");

    options.forEach(option => {
        const roomName = option.value;

        if (!roomName) return;

        if (blockedRooms.has(roomName)) {
            option.disabled = true;
            option.textContent = `${roomName} - 🔴 Đang được sử dụng`;
        } else {
            option.disabled = false;

            const room = roomList.find(
                item => item.room_number === roomName
            );

            if (room) {
                option.textContent =
                    `${room.room_number} - 🟢 Có thể đặt - tối đa ${room.capacity} khách`;
            }
        }
    });
}

// ==========================================
// CHO HTML GỌI ĐƯỢC CÁC HÀM
// ==========================================

window.updateRoomList = updateRoomList;
window.updateRoomPrice = updateRoomPrice;
window.updateCheckOut = updateCheckOut;
window.updateRoomAvailability = updateRoomAvailability;
window.submitBooking = submitBooking;