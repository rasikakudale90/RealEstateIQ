"""
Dataset generator for RealEstateIQ housing benchmark.
Generates realistic residential property data adhering strictly to the SRS specifications.
"""
from pathlib import Path
import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "processed"


def generate_housing_dataset(n_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    locations = ["Urban", "Suburban", "Rural"]
    location_probs = [0.45, 0.40, 0.15]
    loc_choices = np.random.choice(locations, size=n_samples, p=location_probs)

    # Square footage: between 500 and 4500 sqft (log-normal distribution)
    total_sqft = np.random.normal(loc=1600, scale=600, size=n_samples).astype(int)
    total_sqft = np.clip(total_sqft, 500, 5000)

    # Bedrooms: correlated with square footage
    bedrooms = (total_sqft / 500).astype(int) + np.random.randint(-1, 2, size=n_samples)
    bedrooms = np.clip(bedrooms, 1, 6)

    # Bathrooms: typically correlated with bedrooms
    bathrooms = np.round(bedrooms * 0.75 + np.random.uniform(0.2, 0.8, size=n_samples) * 0.5, 1)
    bathrooms = np.clip(bathrooms, 1.0, 5.0)

    # Year built: 1960 to 2024
    year_built = np.random.randint(1960, 2025, size=n_samples)

    # Has garage: 65% probability
    has_garage = np.random.choice([True, False], size=n_samples, p=[0.65, 0.35])

    # Price model formula based on real estate economics (Target: INR)
    base_rate_map = {"Urban": 6800, "Suburban": 4600, "Rural": 2800}
    base_sqft_rates = np.array([base_rate_map[loc] for loc in loc_choices])

    # Age effect (newer properties have price premium)
    current_year = 2026
    age = current_year - year_built
    age_factor = 1.0 - (age * 0.0035)  # 0.35% depreciation per year
    age_factor = np.clip(age_factor, 0.75, 1.15)

    # Garage premium: ~₹3,50,000
    garage_premium = np.where(has_garage, 350000, 0)

    # Bedroom/Bathroom amenity adjustments
    room_premium = (bedrooms * 220000) + (bathrooms * 160000)

    # Pure base valuation
    price = (total_sqft * base_sqft_rates * age_factor) + room_premium + garage_premium

    # Gaussian market variation (+/- 6% standard deviation)
    noise = np.random.normal(1.0, 0.06, size=n_samples)
    price = np.round(price * noise, -3)  # Round to nearest thousand

    df = pd.DataFrame({
        "location": loc_choices,
        "total_sqft": total_sqft,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "year_built": year_built,
        "has_garage": has_garage,
        "price": price,
    })

    return df


if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = generate_housing_dataset()
    output_path = DATA_DIR / "housing_data.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples and saved to {output_path}")
    print(df.head())
    print("\nPrice summary stats:")
    print(df["price"].describe())
