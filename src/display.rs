use std::sync::{Arc, Mutex};
use warp::Filter;

use crate::{apply_gravity, Ball};

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
