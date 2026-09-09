type CityMascotProps = {
  icon: 'bus' | 't-train' | 'bridge';
  priority?: boolean;
};

export default function CityMascot({ icon, priority = false }: CityMascotProps) {
  return (
    <img
      className={`city-mascot city-mascot-${icon}`}
      src={`/mascots/${icon}.webp`}
      width={256}
      height={256}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
