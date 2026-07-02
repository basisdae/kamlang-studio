import Button from "../../../../components/ui/Button";

export default function RecipeActionBar() {
  return (
    <div className="kl-action-bar">
      <div className="kl-action-bar-inner flex gap-2">
        <Button variant="secondary" fullWidth disabled>
          ทำสำเนาสูตร
        </Button>

        <Button fullWidth disabled>
          แปลงเป็นเมนูขาย
        </Button>
      </div>
    </div>
  );
}
