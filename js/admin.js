const SUPABASE_URL = "https://idcsmnlhjnupvrpenlxx.supabase.co";

// GIỮ NGUYÊN PUBLISHABLE KEY DƯƠNG ĐANG DÙNG
const SUPABASE_KEY = "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ========================================
// DỮ LIỆU ĐẶT PHÒNG DÙNG CHO TRA CỨU
// ========================================

let allBookings = [];
let currentSearchKeyword = "";
let currentStatusFilter = "";

// ========================================
// TẢI DANH SÁCH ĐẶT PHÒNG
// ========================================

async function loadBookings() {

    const { data, error } = await supabaseClient
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Lỗi lấy dữ liệu:", error);

        alert(
            "Không thể tải danh sách đặt phòng!\n\n" +
            error.message
        );

        return;
    }

    allBookings = data || [];

updateStatistics(allBookings);
updateRoomStatus(allBookings);

renderAdminBookings();
}



// ========================================
// HIỂN THỊ ĐƠN ĐẶT PHÒNG
// ========================================

function displayBookings(bookings) {

    const tableBody =
        document.getElementById("bookingTableBody");

    tableBody.innerHTML = "";


    if (bookings.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center;">
                    Chưa có đơn đặt phòng nào
                </td>
            </tr>
        `;

        return;
    }


    bookings.forEach(booking => {

        const row = document.createElement("tr");


        // Trạng thái + nút thao tác

        let statusHTML = `
            <strong>${booking.status || "Chờ xác nhận"}</strong>
        `;


        if (booking.status === "Chờ xác nhận") {

            statusHTML += `
                <br><br>

                <button
                    onclick="confirmBooking(${booking.id})"
                    style="
                        background:#2e7d32;
                        color:white;
                        border:none;
                        padding:7px 12px;
                        border-radius:6px;
                        cursor:pointer;
                        margin-right:5px;
                    "
                >
                    Xác nhận
                </button>

                <button
                    onclick="cancelBooking(${booking.id})"
                    style="
                        background:#c62828;
                        color:white;
                        border:none;
                        padding:7px 12px;
                        border-radius:6px;
                        cursor:pointer;
                    "
                >
                    Hủy
                </button>
            `;
        }


// NÚT THAO TÁC
// ========================================

let actionHTML = `
    <button
        onclick="viewBooking(${booking.id})"
        style="
            background:#1976d2;
            color:white;
            border:none;
            padding:7px 12px;
            border-radius:6px;
            cursor:pointer;
            margin-right:5px;
        "
    >
        Xem
    </button>
`;


// ========================================
// NÚT KẾT THÚC PHÒNG
// Chỉ hiện khi khách đang ở
// ========================================

if (
    booking.status === "Đã xác nhận" &&
    booking.check_in &&
    booking.check_out &&
    !booking.actual_check_out
) {

    const now = new Date();

    const checkIn =
        new Date(booking.check_in);

    const checkOut =
        new Date(booking.check_out);

    if (
        now >= checkIn &&
        now < checkOut
    ) {

        actionHTML += `
            <button
                onclick="endRoom(${booking.id})"
                style="
                    background:#ef6c00;
                    color:white;
                    border:none;
                    padding:7px 12px;
                    border-radius:6px;
                    cursor:pointer;
                    margin-right:5px;
                    margin-top:5px;
                "
            >
                KẾT THÚC PHÒNG
            </button>
        `;
    }
}


// ========================================
// NÚT XÓA ĐƠN
// ========================================

actionHTML += `
    <button
        onclick="deleteBooking(${booking.id})"
        style="
            background:#c62828;
            color:white;
            border:none;
            padding:7px 12px;
            border-radius:6px;
            cursor:pointer;
            margin-top:5px;
        "
    >
        Xóa
    </button>
`;


        row.innerHTML = `

            <td>
                ${booking.booking_code || ""}
            </td>

            <td>
                ${booking.customer_name || ""}
            </td>

            <td>
                ${booking.customer_phone || ""}
            </td>

            <td>
                ${booking.room_type || ""}
            </td>

<td>
    ${booking.room_number || ""}
</td>

            <td>
                ${booking.guest_number || ""}
            </td>

            <td>
                ${formatDateTime(booking.check_in)}
            </td>

            <td>
                ${formatDateTime(booking.check_out)}
            </td>

<td>
    ${booking.total_price
        ? new Intl.NumberFormat("vi-VN").format(booking.total_price) + "đ"
        : "0đ"}
</td>

            <td>
                ${statusHTML}
            </td>

            <td>
                ${actionHTML}
            </td>

        `;


        tableBody.appendChild(row);

    });

}



// ========================================
// XÁC NHẬN ĐƠN
// ========================================

async function confirmBooking(id) {

    const answer = confirm(
        "Bạn có chắc chắn muốn xác nhận đơn đặt phòng này?"
    );

    if (!answer) return;


    const { error } = await supabaseClient

        .from("bookings")

        .update({
            status: "Đã xác nhận"
        })

        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Không thể xác nhận đơn!\n\n" +
            error.message
        );

        return;
    }


    alert("Đã xác nhận đơn đặt phòng!");

    loadBookings();

}



// ========================================
// HỦY ĐƠN
// ========================================

async function cancelBooking(id) {

    const answer = confirm(
        "Bạn có chắc chắn muốn hủy đơn đặt phòng này?"
    );

    if (!answer) return;


    const { error } = await supabaseClient

        .from("bookings")

        .update({
            status: "Đã hủy"
        })

        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Không thể hủy đơn!\n\n" +
            error.message
        );

        return;
    }


    alert("Đã hủy đơn đặt phòng!");

    loadBookings();

}

// ========================================
// KẾT THÚC PHÒNG
// ========================================

async function endRoom(id) {
    const { data: booking, error: fetchError } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .eq("id", id)
            .single();

    if (fetchError || !booking) {
        alert("Không tìm thấy đơn đặt phòng.");
        return;
    }

    // Xóa bảng thông báo cũ nếu đang tồn tại
    const oldModal = document.getElementById("endRoomModal");

    if (oldModal) {
        oldModal.remove();
    }

    // Tạo bảng thông báo kết thúc phòng
    const modal = document.createElement("div");

    modal.id = "endRoomModal";

    modal.innerHTML = `
        <div style="
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.55);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:9999;
            padding:20px;
        ">

            <div style="
                width:100%;
                max-width:500px;
                background:white;
                border-radius:15px;
                padding:25px;
                box-shadow:0 10px 35px rgba(0,0,0,0.3);
                color:#333;
            ">

                <h2 style="
                    margin-top:0;
                    margin-bottom:20px;
                    color:#ef6c00;
                    text-align:center;
                ">
                    🏨 KẾT THÚC PHÒNG
                </h2>

                <p style="text-align:center;">
                    Dương có chắc chắn muốn kết thúc phòng này không?
                </p>

                <div style="
                    background:#f5f5f5;
                    border-radius:10px;
                    padding:15px;
                    margin:20px 0;
                    line-height:1.9;
                ">
                    <p>
                        <strong>Mã đơn:</strong>
                        ${booking.booking_code || "Không có"}
                    </p>

                    <p>
                        <strong>Khách hàng:</strong>
                        ${booking.customer_name || "Không có"}
                    </p>

                    <p>
                        <strong>Phòng:</strong>
                        ${booking.room_number || booking.room_type || "Không có"}
                    </p>

                    <p>
                        <strong>Nhận phòng:</strong>
                        ${formatDateTime(booking.check_in)}
                    </p>

                    <p>
                        <strong>Trả phòng dự kiến:</strong>
                        ${formatDateTime(booking.check_out)}
                    </p>

                    <p style="color:#d84315;">
                        <strong>Thời gian chuẩn bị:</strong>
                        2 giờ sau khi kết thúc phòng
                    </p>
                </div>

                <div style="
                    display:flex;
                    gap:10px;
                    justify-content:flex-end;
                ">

                    <button
                        id="cancelEndRoomButton"
                        style="
                            flex:1;
                            padding:11px;
                            border:none;
                            border-radius:8px;
                            background:#9e9e9e;
                            color:white;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        HỦY
                    </button>

                    <button
                        id="confirmEndRoomButton"
                        style="
                            flex:1;
                            padding:11px;
                            border:none;
                            border-radius:8px;
                            background:#ef6c00;
                            color:white;
                            font-weight:bold;
                            cursor:pointer;
                        "
                    >
                        XÁC NHẬN
                    </button>

                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Nút HỦY
    document
        .getElementById("cancelEndRoomButton")
        .addEventListener("click", function () {
            modal.remove();
        });

    // Nút XÁC NHẬN
    document
        .getElementById("confirmEndRoomButton")
        .addEventListener("click", async function () {
            const confirmButton =
                document.getElementById("confirmEndRoomButton");

            confirmButton.disabled = true;
            confirmButton.textContent = "ĐANG XỬ LÝ...";

            const actualCheckOut = new Date();

            const availableTime = new Date(
                actualCheckOut.getTime() +
                2 * 60 * 60 * 1000
            );

            const { error } = await supabaseClient
                .from("bookings")
                .update({
                    actual_check_out:
                        actualCheckOut.toISOString(),

                    status:
                        "Đã kết thúc"
                })
                .eq("id", id);

            if (error) {
                console.error(error);

                alert(
                    "Không thể kết thúc phòng!\n\n" +
                    error.message
                );

                confirmButton.disabled = false;
                confirmButton.textContent = "XÁC NHẬN";

                return;
            }

            modal.remove();

            alert(
                "Đã kết thúc phòng thành công!\n\n" +
                "Thời gian trả thực tế:\n" +
                formatDateTime(actualCheckOut.toISOString()) +
                "\n\nPhòng có thể tiếp tục đón khách từ:\n" +
                formatDateTime(availableTime.toISOString())
            );

            loadBookings();
        });
}



// ========================================
// XEM CHI TIẾT ĐƠN
// ========================================

async function viewBooking(id) {

    const { data, error } = await supabaseClient
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        console.error(error);

        alert(
            "Không thể xem thông tin đơn!\n\n" +
            error.message
        );

        return;
    }

    // Xóa cửa sổ cũ nếu đang tồn tại
    const oldModal =
        document.getElementById("bookingDetailModal");

    if (oldModal) {
        oldModal.remove();
    }

    // Tạo cửa sổ chi tiết
    const modal = document.createElement("div");

    modal.id = "bookingDetailModal";

    modal.innerHTML = `
        <div class="booking-detail-overlay">

            <div class="booking-detail-modal">

                <div class="booking-detail-header">

                    <div>
                        <h2>Chi tiết đơn đặt phòng</h2>
                        <p>
                            Mã đơn:
                            <strong>${data.booking_code || ""}</strong>
                        </p>
                    </div>

                    <button
                        type="button"
                        onclick="closeBookingDetail()"
                        class="booking-detail-close"
                    >
                        ×
                    </button>

                </div>


                <div class="booking-detail-body">

                    <div class="booking-detail-section">

                        <h3>👤 Thông tin khách hàng</h3>

                        <div class="booking-detail-grid">

                            <div>
                                <span>Họ tên</span>
                                <strong>
                                    ${data.customer_name || ""}
                                </strong>
                            </div>

                            <div>
                                <span>Số điện thoại</span>
                                <strong>
                                    ${data.customer_phone || ""}
                                </strong>
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>
                                    ${data.customer_email || "Không có"}
                                </strong>
                            </div>

                            <div>
                                <span>Số khách</span>
                                <strong>
                                    ${data.guest_number || 0} người
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div class="booking-detail-section">

                        <h3>🏠 Thông tin phòng</h3>

                        <div class="booking-detail-grid">

                            <div>
                                <span>Loại phòng</span>
                                <strong>
                                    ${data.room_type || ""}
                                </strong>
                            </div>

                            <div>
                                <span>Phòng</span>
                                <strong>
                                    ${data.room_number || "Không có"}
                                </strong>
                            </div>

                            <div>
                                <span>Nhận phòng</span>
                                <strong>
                                    ${formatDateTime(data.check_in)}
                                </strong>
                            </div>

                            <div>
                                <span>Trả phòng</span>
                                <strong>
                                    ${formatDateTime(data.check_out)}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div class="booking-detail-section">

                        <h3>💰 Thanh toán</h3>

                        <div class="booking-detail-total">

                            <span>Tổng tiền dự kiến</span>

                            <strong>
                                ${
                                    data.total_price
                                        ? new Intl.NumberFormat("vi-VN")
                                            .format(data.total_price) + "đ"
                                        : "0đ"
                                }
                            </strong>

                        </div>

                        <div class="booking-detail-status">

                            <span>Trạng thái</span>

                            <strong>
                                ${data.status || "Chờ xác nhận"}
                            </strong>

                        </div>

                    </div>


                    <div class="booking-detail-section">

                        <h3>📝 Ghi chú</h3>

                        <p class="booking-detail-note">
                            ${data.note || "Khách không có ghi chú."}
                        </p>

                    </div>

                </div>


                <div class="booking-detail-footer">

                    <button
                        type="button"
                        onclick="closeBookingDetail()"
                        class="booking-detail-button"
                    >
                        ĐÓNG
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


// ========================================
// ĐÓNG CHI TIẾT ĐƠN
// ========================================

function closeBookingDetail() {

    const modal =
        document.getElementById("bookingDetailModal");

    if (modal) {
        modal.remove();
    }
}



// ========================================
// THỐNG KÊ
// ========================================

function updateStatistics(bookings) {

    const total = bookings.length;


    const pending = bookings.filter(
        booking =>
            booking.status === "Chờ xác nhận"
    ).length;


    const confirmed = bookings.filter(
        booking =>
            booking.status === "Đã xác nhận"
    ).length;


    const cancelled = bookings.filter(
        booking =>
            booking.status === "Đã hủy"
    ).length;


    document.getElementById("totalBookings").textContent =
        total;


    document.getElementById("pendingBookings").textContent =
        pending;


    document.getElementById("confirmedBookings").textContent =
        confirmed;


    document.getElementById("cancelledBookings").textContent =
        cancelled;

}

// ========================================
// TÌNH TRẠNG PHÒNG HÔM NAY
// ========================================

function updateRoomStatus(bookings) {

    const roomStatusGrid =
        document.getElementById("roomStatusGrid");

    if (!roomStatusGrid) return;


    // ========================================
    // DANH SÁCH 5 PHÒNG THỰC TẾ
    // ========================================

   const rooms = [
    {
        number: "101",
        code: "101",
        type: "Phòng nhóm"
    },
    {
        number: "Bình Minh",
        code: "BM01",
        type: "Phòng lớn"
    },
    {
        number: "Hoàng Hôn",
        code: "HH01",
        type: "Phòng lớn"
    },
    {
        number: "Tự Do",
        code: "TD01",
        type: "Phòng nhỏ"
    },
    {
        number: "An Nhiên",
        code: "AN01",
        type: "Phòng nhỏ"
    }
];


    // ========================================
    // THỜI GIAN HIỆN TẠI
    // ========================================

    const now = new Date();


    // Ngày hôm nay theo giờ Việt Nam
    const todayString =
        now.toLocaleDateString("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh"
        });


    // Hiển thị ngày
    const roomStatusDate =
        document.getElementById("roomStatusDate");

    if (roomStatusDate) {

        roomStatusDate.textContent =
            "Ngày " +
            now.toLocaleDateString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

    }


    // ========================================
    // CHỈ LẤY ĐƠN CHƯA HỦY
    // ========================================

    const activeBookings = bookings.filter(
    booking =>
        booking.status !== "Đã hủy" &&
        booking.status !== "Đã kết thúc" &&
        !booking.actual_check_out
);


    // ========================================
    // XÁC ĐỊNH NHỮNG PHÒNG BỊ ẢNH HƯỞNG
    // ========================================

    function getAffectedRooms(booking) {

        // Nguyên căn = cả 5 phòng
        if (booking.room_type === "Nguyên căn") {

            return [
                "101",
                "Bình Minh",
                "Hoàng Hôn",
                "Tự Do",
                "An Nhiên"
            ];

        }


        // 4PN = 4 phòng
        if (booking.room_type === "4PN") {

            return [
                "Bình Minh",
                "Hoàng Hôn",
                "Tự Do",
                "An Nhiên"
            ];

        }


        // Phòng riêng
        if (booking.room_number) {

            return [booking.room_number];

        }


        return [];

    }


    // ========================================
    // BIẾN THỐNG KÊ
    // ========================================

    let todayCheckInCount = 0;
    let todayCheckOutCount = 0;
    let todayOccupiedCount = 0;
    let todayEmptyCount = 0;


    roomStatusGrid.innerHTML = "";


    // ========================================
    // XỬ LÝ TỪNG PHÒNG
    // ========================================

    rooms.forEach(room => {

        // Tất cả booking liên quan đến phòng
        const roomBookings =
            activeBookings.filter(booking => {

                const affectedRooms =
                    getAffectedRooms(booking);

                return affectedRooms.includes(room.number);

            });


        // ========================================
        // KHÁCH NHẬN PHÒNG HÔM NAY
        // ========================================

        const todayCheckIns =
            roomBookings.filter(booking => {

                if (!booking.check_in) return false;

                const checkIn =
                    new Date(booking.check_in);

                const checkInDate =
                    checkIn.toLocaleDateString("en-CA", {
                        timeZone: "Asia/Ho_Chi_Minh"
                    });

                return checkInDate === todayString;

            });


        // ========================================
        // KHÁCH TRẢ PHÒNG HÔM NAY
        // ========================================

        const todayCheckOuts =
            roomBookings.filter(booking => {

                if (!booking.check_out) return false;

                const checkOut =
                    new Date(booking.check_out);

                const checkOutDate =
                    checkOut.toLocaleDateString("en-CA", {
                        timeZone: "Asia/Ho_Chi_Minh"
                    });

                return checkOutDate === todayString;

            });


        // ========================================
        // KHÁCH ĐANG Ở
        // ========================================

        const currentlyOccupied =
            roomBookings.find(booking => {

                if (
                    !booking.check_in ||
                    !booking.check_out
                ) {
                    return false;
                }

                const checkIn =
                    new Date(booking.check_in);

                const checkOut =
                    new Date(booking.check_out);

                return (
                    now >= checkIn &&
                    now < checkOut
                );

            });


        // ========================================
        // KHÁCH SẮP NHẬN PHÒNG
        // ========================================

        const upcomingCheckIn =
            todayCheckIns
                .filter(booking => {

                    return new Date(booking.check_in) > now;

                })
                .sort((a, b) => {

                    return (
                        new Date(a.check_in) -
                        new Date(b.check_in)
                    );

                })[0];


        // ========================================
        // XÁC ĐỊNH TRẠNG THÁI
        // ========================================

        let statusText = "⚪ Phòng trống";
        let borderColor = "#ccc";


        // -------------------------
        // ĐANG CÓ KHÁCH
        // -------------------------

        if (currentlyOccupied) {

            // Nếu hôm nay trả phòng
            const checkOutDate =
                new Date(
                    currentlyOccupied.check_out
                ).toLocaleDateString("en-CA", {
                    timeZone: "Asia/Ho_Chi_Minh"
                });


            if (checkOutDate === todayString) {

                statusText =
                    "🟠 Sắp trả phòng";

                borderColor =
                    "#ff9800";

            }
            else {

                statusText =
                    "🔵 Đang có khách";

                borderColor =
                    "#1976d2";

            }


            todayOccupiedCount++;

        }


        // -------------------------
        // SẮP CÓ KHÁCH ĐẾN
        // -------------------------

        else if (upcomingCheckIn) {

            statusText =
                "🟡 Sắp nhận phòng";

            borderColor =
                "#ffc107";

        }


        // -------------------------
        // PHÒNG TRỐNG
        // -------------------------

        else {

            todayEmptyCount++;

        }


        // ========================================
        // THỐNG KÊ NHẬN / TRẢ
        // ========================================

        if (todayCheckIns.length > 0) {

            todayCheckInCount++;

        }


        if (todayCheckOuts.length > 0) {

            todayCheckOutCount++;

        }

// ========================================
// HIỂN THỊ TIỀN PHÒNG
// ========================================

let priceHTML = "";

const currentBooking =
    currentlyOccupied || upcomingCheckIn;

if (currentBooking) {

    const totalPrice =
        Number(currentBooking.total_price || 0);

    priceHTML = `
        <div class="room-price">
            💰 Tiền phòng:
            <strong>
                ${new Intl.NumberFormat("vi-VN").format(totalPrice)}đ
            </strong>
        </div>
    `;

}

        // ========================================
        // HIỂN THỊ KHÁCH
        // ========================================

        let guestHTML = "";
let bookingCodeHTML = "";

let roomActionHTML = "";

if (currentlyOccupied) {
    roomActionHTML = `
        <button
            onclick="endRoom(${currentlyOccupied.id})"
            style="
                width:100%;
                margin-top:15px;
                padding:10px;
                background:#ef6c00;
                color:white;
                border:none;
                border-radius:8px;
                cursor:pointer;
                font-size:15px;
                font-weight:bold;
            "
        >
            KẾT THÚC PHÒNG
        </button>
    `;
}

        if (currentlyOccupied) {

    guestHTML = `
        <div class="room-guest">
            👤 Khách:
            <strong>
                ${currentlyOccupied.customer_name || "Khách"}
            </strong>
        </div>
    `;

    bookingCodeHTML = `
        <div class="room-booking-code">
            🎫 Mã đơn:
            <strong>
                ${currentlyOccupied.booking_code || "Không có"}
            </strong>
        </div>
    `;

}
else if (upcomingCheckIn) {

    guestHTML = `
        <div class="room-guest">
            👤 Khách:
            <strong>
                ${upcomingCheckIn.customer_name || "Khách"}
            </strong>
        </div>
    `;

    bookingCodeHTML = `
        <div class="room-booking-code">
            🎫 Mã đơn:
            <strong>
                ${upcomingCheckIn.booking_code || "Không có"}
            </strong>
        </div>
    `;

}


        // ========================================
        // HIỂN THỊ THỜI GIAN
        // ========================================

        let timeHTML = "";


        if (currentlyOccupied) {

            timeHTML += `
                <div class="room-time">
                    🟢 Nhận:
                    ${formatDateTime(currentlyOccupied.check_in)}
                </div>

                <div class="room-time">
                    🔴 Trả:
                    ${formatDateTime(currentlyOccupied.check_out)}
                </div>
            `;

        }
        else if (upcomingCheckIn) {

            timeHTML += `
                <div class="room-time">
                    🟢 Nhận:
                    ${formatDateTime(upcomingCheckIn.check_in)}
                </div>

                <div class="room-time">
                    🔴 Trả:
                    ${formatDateTime(upcomingCheckIn.check_out)}
                </div>
            `;

        }
        else if (todayCheckOuts.length > 0) {

            const booking =
                todayCheckOuts[0];

            timeHTML += `
                <div class="room-time">
                    🟠 Trả:
                    ${formatDateTime(booking.check_out)}
                </div>
            `;

        }


        // ========================================
        // TẠO CARD PHÒNG
        // ========================================

        const card =
            document.createElement("div");

        card.className =
            "room-status-card";


        card.style.borderTopColor =
            borderColor;


        card.innerHTML = `

    <h3>
        ${room.number}
    </h3>

    <div class="room-code">
        Mã phòng: <strong>${room.code}</strong>
    </div>

    <div class="room-type">
        ${room.type}
    </div>

    <div
        class="room-status"
        style="color: ${borderColor};"
    >
        ${statusText}
    </div>

    ${timeHTML}

${guestHTML}

${bookingCodeHTML}

${priceHTML}

${roomActionHTML}

`;
        roomStatusGrid.appendChild(card);

    });


    // ========================================
    // CẬP NHẬT 4 Ô THỐNG KÊ
    // ========================================

    document.getElementById(
        "todayCheckInCount"
    ).textContent =
        todayCheckInCount;


    document.getElementById(
        "todayCheckOutCount"
    ).textContent =
        todayCheckOutCount;


    document.getElementById(
        "todayOccupiedCount"
    ).textContent =
        todayOccupiedCount;


    document.getElementById(
        "todayEmptyCount"
    ).textContent =
        todayEmptyCount;

}

// ========================================
// ĐỊNH DẠNG NGÀY
// ========================================

function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("vi-VN");

}

function formatDateTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
// ========================================
// XÓA MỘT ĐƠN ĐẶT PHÒNG
// ========================================

async function deleteBooking(id) {

    const { data: booking, error: fetchError } =
        await supabaseClient
            .from("bookings")
            .select("booking_code, customer_name, room_number")
            .eq("id", id)
            .single();

    if (fetchError || !booking) {

        alert("Không tìm thấy đơn đặt phòng cần xóa.");

        return;
    }

    const answer = confirm(
        "Bạn có chắc chắn muốn xóa đơn này không?\n\n" +
        "Mã đơn: " + (booking.booking_code || "Không có") + "\n" +
        "Khách: " + (booking.customer_name || "Không có") + "\n" +
        "Phòng: " + (booking.room_number || "Không có") + "\n\n" +
        "Hành động này không thể hoàn tác!"
    );

    if (!answer) return;

    const { error } = await supabaseClient
        .from("bookings")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert(
            "Không thể xóa đơn!\n\n" +
            error.message
        );

        return;
    }

    alert("Đã xóa đơn đặt phòng!");

    loadBookings();
}
// ========================================
// XÓA TẤT CẢ ĐƠN
// ========================================

async function clearAllBookings() {

    const answer = confirm(

        "Bạn có chắc chắn muốn xóa TẤT CẢ đơn đặt phòng không?\n\n" +

        "Hành động này không thể hoàn tác!"

    );


    if (!answer) return;


    const { error } = await supabaseClient

        .from("bookings")

        .delete()

        .neq("id", 0);


    if (error) {

        console.error(error);

        alert(
            "Không thể xóa các đơn!\n\n" +
            error.message
        );

        return;
    }


    alert("Đã xóa tất cả đơn đặt phòng!");

    loadBookings();

}



// ========================================
// KHI TRANG ĐƯỢC MỞ
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        // Không đăng nhập
        // → quay về trang login

        if (!session) {

            window.location.href =
                "login.html";

            return;

        }


        // Đã đăng nhập
        // → tải dữ liệu quản trị

        loadBookings();

    }
);

// ========================================
// TRA CỨU ĐẶT PHÒNG
// ========================================

function renderAdminBookings() {

    let filteredBookings = [...allBookings];

    // LỌC THEO TỪ KHÓA
    if (currentSearchKeyword) {

        const keyword = currentSearchKeyword.toLowerCase();

        filteredBookings = filteredBookings.filter(booking => {

            const bookingCode =
                String(booking.booking_code || "").toLowerCase();

            const customerName =
                String(booking.customer_name || "").toLowerCase();

            const customerPhone =
                String(booking.customer_phone || "").toLowerCase();

            return (
                bookingCode.includes(keyword) ||
                customerName.includes(keyword) ||
                customerPhone.includes(keyword)
            );
        });
    }

    // LỌC THEO TRẠNG THÁI
    if (currentStatusFilter) {

        filteredBookings = filteredBookings.filter(booking =>
            booking.status === currentStatusFilter
        );
    }

    // HIỂN THỊ KẾT QUẢ
    displayBookings(filteredBookings);

    // CẬP NHẬT THÔNG BÁO KẾT QUẢ
    let message = `Đang hiển thị ${filteredBookings.length} đơn`;

    if (currentSearchKeyword) {
        message += ` phù hợp với "${currentSearchKeyword}"`;
    }

    if (currentStatusFilter) {
        message += ` — trạng thái: ${currentStatusFilter}`;
    }

    message += ".";

    updateSearchResult(message);
}

function searchAdminBookings() {

    const input =
        document.getElementById("adminSearchInput");

    if (!input) {
        return;
    }

    currentSearchKeyword = input.value.trim();

    renderAdminBookings();
}


function clearAdminSearch() {

    const input =
        document.getElementById("adminSearchInput");

    if (input) {
        input.value = "";
        input.focus();
    }

    currentSearchKeyword = "";

    renderAdminBookings();
}


function updateSearchResult(message) {

    const result =
        document.getElementById("adminSearchResult");

    if (result) {
        result.textContent = message;
    }
}


document.addEventListener("DOMContentLoaded", function () {

    const input =
        document.getElementById("adminSearchInput");

    if (input) {

        input.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                searchAdminBookings();
            }

        });

    }

});

function filterAdminBookings() {

    const filter = document.getElementById("adminStatusFilter");

    if (!filter) return;

    currentStatusFilter = filter.value;

    renderAdminBookings();
}

// ==================== ĐĂNG XUẤT ADMIN ====================

async function logoutAdmin() {
    const confirmLogout = confirm("Bạn có chắc muốn đăng xuất không?");

    if (!confirmLogout) {
        return;
    }

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Đăng xuất thất bại: " + error.message);
        return;
    }

    window.location.href = "login.html";
}