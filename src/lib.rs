pub mod ball;
pub mod vector;

pub use ball::Ball;
pub use vector::Vector;

use std::sync::{Arc, Mutex};
use warp::Filter;

pub fn apply_gravity(balls: &mut [Ball], gravitational_constant: f64) {
    for i in 0..balls.len() {
        let mut total_acceleration = Vector::new(0.0, 0.0);

        for j in 0..balls.len() {
            if i == j {
                continue; // Skip self
            }

            let displacement = balls[j].position - balls[i].position;
            let distance = displacement.magnitude();

            let safe_distance = if distance < balls[i].radius + balls[j].radius {
                balls[i].radius + balls[j].radius
            } else {
                distance
            };

            let force_magnitude = gravitational_constant * balls[i].mass * balls[j].mass
                / (safe_distance * safe_distance);

            let acceleration = displacement.normalize() * (force_magnitude / balls[i].mass);

            total_acceleration += acceleration;
        }

        // Update the ball's acceleration
        balls[i].acceleration = total_acceleration;
    }
}

pub fn run_simulation_continuous(
    mut balls: Vec<Ball>,
    gravitational_constant: f64,
    time_step: f64,
) -> impl Iterator<Item = Vec<(f64, f64)>> {
    std::iter::from_fn(move || {
        let positions: Vec<(f64, f64)> = balls
            .iter()
            .map(|ball| (ball.position.x, ball.position.y))
            .collect();

        apply_gravity(&mut balls, gravitational_constant);

        for ball in balls.iter_mut() {
            ball.update(time_step);
        }

        Some(positions)
    })
}

pub async fn start_simulation_server(
    balls: Vec<Ball>,
    gravitational_constant: f64,
    time_step: f64,
) {
    let simulation = Arc::new(Mutex::new(run_simulation_continuous(
        balls,
        gravitational_constant,
        time_step,
    )));

    let simulation_route = warp::path("simulation").map({
        let simulation = Arc::clone(&simulation);
        move || {
            let mut sim = simulation.lock().unwrap(); // Lock the mutex to access the iterator
            let frame = sim.next().unwrap(); // Get the next frame
            warp::reply::json(&frame)
        }
    });

    let static_files = warp::fs::dir("static");

    let routes = simulation_route.or(static_files);

    println!("Server running at http://127.0.0.1:3030");
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
