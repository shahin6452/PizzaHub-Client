
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  Crown,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";

const chart: { day: string; orders: number }[] = [];

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    activeItems: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    plan: "free",
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [trend, setTrend] = useState(chart);

  const isPremium = stats.plan?.toLowerCase() === "premium";

  useEffect(() => {
    api<{
      stats: typeof stats;
      recentOrders: any[];
      orderTrend: { day: string; orders: number }[];
    }>("/api/dashboard/vendor")
      .then((r) => {
        setStats(r.stats);
        setOrders(r.recentOrders || []);

        if (r.orderTrend?.length) {
          setTrend(r.orderTrend);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">
            YOUR RESTAURANT AT A GLANCE
          </span>
          <h1>
            Welcome back, <em>chef.</em>
          </h1>
          <p>Here’s what’s cooking with your restaurant today.</p>
        </div>

        <Link
          href="/dashboard/menu-items?add=1"
          className="btn btn-primary"
        >
          <Plus size={17} /> Add menu item
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-yellow">
          <span><Package /></span>
          <small>Total menu items</small>
          <strong>{stats.totalItems}</strong>
          <em>All submissions</em>
        </div>

        <div className="stat-card stat-green">
          <span><TrendingUp /></span>
          <small>Active items</small>
          <strong>{stats.activeItems}</strong>
          <em>Visible to customers</em>
        </div>

        <div className="stat-card stat-peach">
          <span><ClipboardList /></span>
          <small>Pending orders</small>
          <strong>{stats.pendingOrders}</strong>
          <em>Need your attention</em>
        </div>

        <div className="stat-card stat-green">
          <span><ClipboardList /></span>
          <small>Accepted orders</small>
          <strong>{stats.acceptedOrders}</strong>
          <em>Confirmed by your kitchen</em>
        </div>

        <div className="stat-card stat-lilac">
          <span><Crown /></span>
          <small>Current plan</small>
          <strong className="stat-plan">{stats.plan}</strong>
          <em>
            {isPremium
              ? "Unlimited items"
              : "3 active items maximum"}
          </em>
        </div>
      </div>

      <div className="dashboard-two-col">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Order activity</h2>
              <p>Your order pulse over the last seven days</p>
            </div>
            <span className="panel-chip">Last 7 days</span>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient
                    id="ordersFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#e8a900"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="#e8a900"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--line)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#c98f00"
                  strokeWidth={3}
                  fill="url(#ordersFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {!isPremium && (
          <section className="panel plan-panel">
            <div className="plan-crown">
              <Crown />
            </div>
            <span className="section-kicker">GROW WITH PIZZAHUB</span>
            <h2>
              More menu.
              <br />
              <em>More discovery.</em>
            </h2>
            <p>
              Get unlimited active items and a featured Premium
              badge for your restaurant.
            </p>
            <Link href="/subscription" className="btn btn-dark">
              Explore Premium <ArrowUpRight size={16} />
            </Link>
          </section>
        )}
      </div>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent customer orders</h2>
            <p>Latest orders from your menu</p>
          </div>
          <Link href="/dashboard/orders" className="text-link">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Delivery date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {orders.length ? (
                orders.slice(0, 5).map((o) => (
                  <tr key={o._id}>
                    <td>#{o._id.slice(-6)}</td>
                    <td>{o.customerName || "Customer"}</td>
                    <td>
                      {new Date(o.deliveryDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status status-${o.status}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <Link href="/dashboard/orders">Open</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="table-empty">
                    Your new orders will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
