import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler
);


const Dashboard = () => {

  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: "Total Members",
        data: [400, 480, 530, 600, 700, 650, 750, 850, 680, 760, 820, 900],
        backgroundColor: [
          "#cfe2f3", "#cfe2f3", "#cfe2f3", "#cfe2f3",
          "#cfe2f3", "#cfe2f3", "#cfe2f3",
          "#cfe2f3",
          "#cfe2f3", "#cfe2f3", "#cfe2f3", "#cfe2f3",
        ],
        hoverBackgroundColor: "#f4d03f",
        borderRadius: 30,
        barThickness: 35,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#555",
        borderColor: "#ddd",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => `Total Members: ${context.raw}`,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 100,
        },
        grid: {
          color: "#eee",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const earningsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Earnings",
        data: [2800, 3500, 4800, 7500, 8200, 9200],
        borderColor: "#6fa8dc",
        backgroundColor: "rgba(111,168,220,0.25)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#6fa8dc",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const stats = [
    {
      title: "Total Members",
      value: 120,
      color: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      title: "Total Trainers",
      value: 10,
      color: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      title: "Monthly Earnings",
      value: "₹1,50,000",
      color: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    {
      title: "Total Sessions",
      value: 480,
      color: "bg-purple-100",
      textColor: "text-purple-700",
    },
    {
      title: "Pending Verifications",
      value: 5,
      color: "bg-red-100",
      textColor: "text-red-700",
    },
  ];

  const statsData = [
    {
      title: "Total Trainers",
      value: 520,
      suffix: "Trainers",
      subtitle: "Active trainers",
    },
    {
      title: "Pending verifications",
      value: 5,
      suffix: "Requests",
      subtitle: "Waiting for review",
    },
    {
      title: "Total Sessions",
      value: 20,
      suffix: "Sessions",
      subtitle: "This month activity",
    },
  ];


  const earningsOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#555",
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value / 1000}k`,
        },
        grid: {
          color: "#eee",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const planBuysData = {
    datasets: [
      // Outer Ring – Basic Plan
      {
        data: [50, 50],
        backgroundColor: ["#b7d8f5", "#f1f1f1"],
        borderWidth: 0,
        radius: "100%",
        cutout: "60%",
      },

      // Middle Ring – Premium Plan
      {
        data: [30, 70],
        backgroundColor: ["#f7dc6f", "#f1f1f1"],
        borderWidth: 0,
        radius: "85%",
        cutout: "50%",
      },

      // Inner Ring – Yearly Plan
      {
        data: [20, 80],
        backgroundColor: ["#c8e96b", "#f1f1f1"],
        borderWidth: 0,
        radius: "70%",
        cutout: "40%",
      },
    ],
  };

  const planBuysOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#555",
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const value = context.raw;

            if (datasetIndex === 0) return `Basic Plan: ${value}%`;
            if (datasetIndex === 1) return `Premium Plan: ${value}%`;
            if (datasetIndex === 2) return `Yearly Plan: ${value}%`;
          },
        },
      }

    },
  };
  const reviewsData = [
    {
      name: "Sarah Johnson",
      rating: "5/5",
      image: "https://i.pravatar.cc/100?img=1",
      review:
        "Jordan's classes are challenging but rewarding. I've made great progress in strength and fitness, and his positive energy keeps me motivated!",
    },
    {
      name: "Michael Brown",
      rating: "4.7/5",
      image: "https://i.pravatar.cc/100?img=2",
      review:
        "Jordan is a fantastic trainer whose knowledge and motivation make sessions productive. I've significantly improved my endurance with him.",
    },
    {
      name: "Lisa Parker",
      rating: "4.9/5",
      image: "https://i.pravatar.cc/100?img=3",
      review:
        "Jordan's training programs have transformed my fitness journey with personalized, attentive classes that truly cater to my needs.",
    },
  ];


  return (
    <div className="max-w-7xl mx-auto p-6 mt-6 bg-white">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Hello,Admin Dashboard</h1>

      <section className="w-full py-10">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsData.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-3xl p-6"
              >
                <p className="text-gray-500 text-sm mb-4">
                  {item.title}
                </p>

                <h2 className="text-4xl font-bold text-gray-900">
                  {item.value}{" "}
                  <span className="text-lg font-medium text-gray-600">
                    {item.suffix}
                  </span>
                </h2>

                <p className="text-sm text-gray-400 mt-4">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>



      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Analytics</h2>


        <div>
          <div className="space-y-6">

            {/* Total Members */}
            <div className="w-full max-w-[650px] border rounded-2xl p-4 border-gray-300">
              <h3 className="font-semibold mb-2">Total Members</h3>
              <Bar data={data} options={options} />
            </div>

            {/* Monthly Earnings */}
            <div className="w-full max-w-[650px] border rounded-2xl p-4 border-gray-300">
              <h3 className="font-semibold mb-1">Monthly Earnings</h3>
              <p className="text-sm text-gray-500 mb-3">
                Total Earnings: <span className="font-semibold">₹36,300</span> • 15% increase from last period
              </p>
              <Line data={earningsData} options={earningsOptions} />
            </div>

          </div>
          {/* Total Plan Buys */}
          <div className="w-full max-w-[300px] border rounded-2xl p-4 border-gray-300 bg-white">

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Total Plan Buys</h3>
              <span className="text-sm bg-lime-200 px-3 py-1 rounded-full">
                This Week
              </span>
            </div>

            <div className="w-full h-[200px] items-center justify-center flex">
              <Doughnut data={planBuysData} options={planBuysOptions} />
            </div>

            <div className="mt-6 space-y-4 text-sm">

              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#b7d8f5] mt-1"></span>
                  <div>
                    <p className="font-semibold">Basic Plan</p>
                    <p className="text-gray-500">Most popular monthly option.</p>
                  </div>
                </div>
                <p className="font-semibold">50%</p>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f7dc6f] mt-1"></span>
                  <div>
                    <p className="font-semibold">Premium Plan</p>
                    <p className="text-gray-500">Includes all classes & amenities.</p>
                  </div>
                </div>
                <p className="font-semibold">30%</p>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#c8e96b] mt-1"></span>
                  <div>
                    <p className="font-semibold">Yearly Plan</p>
                    <p className="text-gray-500">Best value for long-term commitment.</p>
                  </div>
                </div>
                <p className="font-semibold">20%</p>
              </div>

            </div>
          </div>

        </div>

        <section className="w-full py-10 bg-gray-100 rounded-xl">
  <div className="max-w-7xl mx-auto px-4">

    <h2 className="text-lg font-semibold text-gray-700 mb-6">
      Reviews
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {reviewsData.map((review, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={review.image}
              alt={review.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {review.name}
              </p>
              <p className="text-sm text-yellow-500">
                ⭐ {review.rating}
              </p>
            </div>
          </div>

          {/* Review Text */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {review.review}
          </p>
        </div>
      ))}
    </div>

  </div>
</section>

      </div>
    </div>
  );
};

export default Dashboard;
