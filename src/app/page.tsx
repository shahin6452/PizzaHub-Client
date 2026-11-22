"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  ChefHat,
  Clock3,
  MapPin,
  ShieldCheck,
  Truck,
  Utensils,
  WalletCards,
} from "lucide-react";
import { PizzaGrid } from "@/components/pizza-grid";
import { categories } from "@/lib/data";

const MotionLink = motion.create(Link);
const categoryIcons = ["🍕", "🌿", "🍗", "🧀", "🍟", "🥤"];

const revealViewport = { once: true, amount: 0.18 };
const revealTransition = { duration: 0.55, ease: "easeOut" as const };

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  const revealInitial = reduceMotion ? false : { opacity: 0, y: 24 };
  const revealVisible = { opacity: 1, y: 0 };

  return (
    <main>
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <span className="eyebrow">
              <span className="eyebrow-dot" /> FRESH FROM YOUR NEIGHBOURHOOD
            </span>
            <h1>
              Good days start with <em>great pizza.</em>
            </h1>
            <p>
              Find the local pizza makers you love. Discover something new,
              order in a few clicks, and let the good times roll.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-dark" href="/browse">
                Explore pizza menu <ArrowRight size={17} />
              </Link>
              <Link className="text-link hero-secondary" href="/sign-up">
                Partner with us <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <span>🍕</span>
                <span>👨‍🍳</span>
                <span>⭐</span>
              </div>
              <div>
                <strong>Local flavour, loved by many</strong>
                <small>Freshly made by independent kitchens</small>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12 }}
          >
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1200&q=90"
                alt="Freshly baked pizza with basil"
              />
              <div className="hero-sticker">
                <span>HOT & FRESH</span>
                <strong>
                  Made with
                  <br />
                  love <b>♥</b>
                </strong>
              </div>
            </div>
            <div className="floating-note">
              <span className="floating-icon">
                <Bike />
              </span>
              <div>
                <strong>At your doorstep</strong>
                <small>Freshness on the way</small>
              </div>
            </div>
            <span className="hero-spark spark-one">✳</span>
            <span className="hero-spark spark-two">✦</span>
          </motion.div>
        </div>

        <div className="hero-bottom container">
          <span>
            <Truck /> Local delivery
          </span>
          <span>
            <ShieldCheck /> Trusted kitchens
          </span>
          <span>
            <ChefHat /> Made to order
          </span>
        </div>
      </section>

      <section className="category-section section-pad">
        <div className="container">
          <motion.div
            className="section-heading"
            initial={revealInitial}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={revealTransition}
          >
            <div>
              <span className="section-kicker">FIND YOUR CRAVING</span>
              <h2>
                What sounds good <em>today?</em>
              </h2>
            </div>
            <Link href="/browse" className="text-link">
              All categories <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          <div className="category-row">
            {categories.slice(1).map((c, i) => (
              <MotionLink
                href={`/browse?category=${encodeURIComponent(c)}`}
                className="category-tile"
                key={c}
                initial={revealInitial}
                whileInView={revealVisible}
                viewport={revealViewport}
                transition={{
                  ...revealTransition,
                  delay: reduceMotion ? 0 : i * 0.07,
                }}
                whileHover={reduceMotion ? undefined : { y: -5 }}
              >
                <span>{categoryIcons[i]}</span>
                <strong>{c}</strong>
              </MotionLink>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section section-pad">
        <div className="container">
          <motion.div
            className="section-heading"
            initial={revealInitial}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={revealTransition}
          >
            <div>
              <span className="section-kicker">THE CROWD PLEASERS</span>
              <h2>
                Popular right <em>now.</em>
              </h2>
              <p>
                Handpicked favourites from the neighbourhood’s best pizza
                kitchens.
              </p>
            </div>
            <Link href="/browse" className="btn btn-outline">
              Browse all <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            initial={revealInitial}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={{ ...revealTransition, delay: 0.08 }}
          >
            <PizzaGrid limit={6} />
          </motion.div>
        </div>
      </section>

      <section className="how-section section-pad">
        <div className="container how-grid">
          <motion.div
            className="how-copy"
            initial={revealInitial}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={revealTransition}
          >
            <span className="section-kicker">A FEW CLICKS TO JOY</span>
            <h2>
              Pizza night,
              <br />
              <em>made easy.</em>
            </h2>
            <p>
              From first craving to that first cheesy bite, we make finding
              your next favourite simple.
            </p>
            <Link href="/browse" className="btn btn-dark">
              Find your pizza <ArrowRight size={17} />
            </Link>
          </motion.div>

          <div className="steps-grid">
            <motion.div
              className="step-card"
              initial={revealInitial}
              whileInView={revealVisible}
              viewport={revealViewport}
              transition={revealTransition}
            >
              <span>01</span>
              <div className="step-icon">
                <MapPin />
              </div>
              <h3>Find nearby</h3>
              <p>
                Explore neighbourhood pizza restaurants and discover their
                menus.
              </p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={revealInitial}
              whileInView={revealVisible}
              viewport={revealViewport}
              transition={{ ...revealTransition, delay: reduceMotion ? 0 : 0.1 }}
            >
              <span>02</span>
              <div className="step-icon">
                <Utensils />
              </div>
              <h3>Choose your bite</h3>
              <p>
                Compare flavours, prices and ratings before you decide.
              </p>
            </motion.div>

            <motion.div
              className="step-card"
              initial={revealInitial}
              whileInView={revealVisible}
              viewport={revealViewport}
              transition={{ ...revealTransition, delay: reduceMotion ? 0 : 0.2 }}
            >
              <span>03</span>
              <div className="step-icon">
                <Bike />
              </div>
              <h3>Enjoy the moment</h3>
              <p>
                Place your order with a delivery date and address.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="why-section section-pad">
        <div className="container">
          <motion.div
            className="section-heading centered"
            initial={revealInitial}
            whileInView={revealVisible}
            viewport={revealViewport}
            transition={revealTransition}
          >
            <div>
              <span className="section-kicker">WHY PIZZAHUB</span>
              <h2>
                Good food. <em>Good people.</em>
              </h2>
              <p>
                A better way to find the pizza places that make your
                neighbourhood special.
              </p>
            </div>
          </motion.div>

          <div className="benefit-grid">
            {[
              {
                icon: ChefHat,
                title: "Local kitchens",
                description:
                  "Discover independent restaurants and the people behind every pie.",
              },
              {
                icon: ShieldCheck,
                title: "Trusted choices",
                description:
                  "See restaurant details, ratings and menu information before ordering.",
              },
              {
                icon: Clock3,
                title: "Order your way",
                description:
                  "Choose your delivery date and share special instructions with the kitchen.",
              },
              {
                icon: WalletCards,
                title: "Clear pricing",
                description:
                  "Compare prices up front and keep your order details in one place.",
              },
            ].map(({ icon: Icon, title, description }, index) => (
              <motion.div
                className="benefit-card"
                key={title}
                initial={revealInitial}
                whileInView={revealVisible}
                viewport={revealViewport}
                transition={{
                  ...revealTransition,
                  delay: reduceMotion ? 0 : index * 0.08,
                }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <span>
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="vendor-banner">
        <motion.div
          className="container vendor-banner-inner"
          initial={revealInitial}
          whileInView={revealVisible}
          viewport={revealViewport}
          transition={revealTransition}
        >
          <div className="vendor-illustration">
            <span>🍕</span>
            <span>✦</span>
          </div>
          <div>
            <span className="section-kicker">FOR RESTAURANT OWNERS</span>
            <h2>
              Your kitchen deserves
              <br />
              <em>the spotlight.</em>
            </h2>
            <p>
              Bring your menu to hungry neighbours. Start with our free plan
              and grow with PizzaHub.
            </p>
          </div>
          <Link href="/sign-up" className="btn btn-primary">
            Become a vendor <ArrowRight size={17} />
          </Link>
        </motion.div>
      </section>

      <section className="review-strip section-pad">
        <motion.div
          className="container review-inner"
          initial={revealInitial}
          whileInView={revealVisible}
          viewport={revealViewport}
          transition={revealTransition}
        >
          <div>
            <span className="section-kicker">
              A LITTLE LOVE FROM THE COMMUNITY
            </span>
            <h2>
              Made for <em>sharing.</em>
            </h2>
          </div>
          <div className="review-quote">
            <div className="review-stars">★★★★★</div>
            <blockquote>
              “Found a tiny local pizza place I’d never noticed. The crust was
              incredible and ordering was a breeze.”
            </blockquote>
            <span>— A happy pizza lover in Dhaka</span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
